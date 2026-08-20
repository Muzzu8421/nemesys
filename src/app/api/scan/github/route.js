import { parseFiles } from "../../../../core/parser";
import { analyzeFiles } from "../../../../core/taint-analysis";
import { connectToDatabase } from "@/lib/mongodb";
import Conversation from "@/models/Conversation";
import Finding from "@/models/Finding";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const IGNORED_PATTERNS = [
  "node_modules/",
  ".git/",
  ".next/",
  "dist/",
  "build/",
  "package-lock.json",
  "yarn.lock",
  "pnpm-lock.yaml",
];

const SUPPORTED_EXTENSIONS = [".js", ".jsx", ".ts", ".tsx", ".py"];
const MAX_FILE_SIZE_BYTES = 500 * 1024;

// --- Raw-content fetch tuning ---
// GitHub's raw.githubusercontent.com CDN will reset connections
// (ECONNRESET) under a sudden burst of many simultaneous requests from
// one IP. Fetching in small batches, with a timeout + retry per file,
// turns that from "one reset 500s the whole scan" into "a transient
// hiccup that gets retried, and a handful of stubborn files just get
// skipped instead of failing everything."
const FETCH_CONCURRENCY = 8;
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 500;
const FETCH_TIMEOUT_MS = 10_000;

// Optional — if set, used to authenticate GitHub API calls (not the raw
// CDN, which doesn't use this). Unauthenticated requests to
// api.github.com are capped at 60/hour per IP; authenticated jumps to
// 5,000/hour. Read from env only — never hardcode a token here.
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

function githubApiHeaders() {
  const headers = { Accept: "application/vnd.github+json" };
  if (GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${GITHUB_TOKEN}`;
  }
  return headers;
}

function isIgnored(filePath) {
  return IGNORED_PATTERNS.some((pattern) => filePath.includes(pattern));
}

function isSupportedExtension(filePath) {
  return SUPPORTED_EXTENSIONS.some((ext) => filePath.endsWith(ext));
}

function parseGithubUrl(repoUrl) {
  const match = repoUrl
    .trim()
    .match(/^https:\/\/github\.com\/([\w.-]+)\/([\w.-]+)\/?$/);
  if (!match) return null;
  return { owner: match[1], repo: match[2] };
}

async function fetchFileWithRetry(rawUrl, item, attempt = 0) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(rawUrl, { signal: controller.signal });
    if (!res.ok) return null;
    const content = await res.text();
    return { path: item.path, content, size: item.size };
  } catch (err) {
    const isRetryable =
      err.cause?.code === "ECONNRESET" ||
      err.cause?.code === "ETIMEDOUT" ||
      err.name === "AbortError";

    if (isRetryable && attempt < MAX_RETRIES) {
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS * (attempt + 1)));
      return fetchFileWithRetry(rawUrl, item, attempt + 1);
    }

    console.warn(
      `[scan/github] Failed to fetch ${item.path} after ${attempt + 1} attempt(s): ${err.message}`
    );
    return null; // isolate this file's failure — don't take down the whole scan
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchFilesInBatches(files, owner, repo, defaultBranch, concurrency = FETCH_CONCURRENCY) {
  const results = [];
  for (let i = 0; i < files.length; i += concurrency) {
    const batch = files.slice(i, i + concurrency);
    const batchResults = await Promise.all(
      batch.map((item) => {
        const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${defaultBranch}/${item.path}`;
        return fetchFileWithRetry(rawUrl, item);
      })
    );
    results.push(...batchResults);
  }
  return results;
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    await connectToDatabase();

    const { repoUrl } = await request.json();

    if (!repoUrl) {
      return Response.json({ error: "No repository URL provided." }, { status: 400 });
    }

    const parsed = parseGithubUrl(repoUrl);
    if (!parsed) {
      return Response.json(
        { error: "Invalid GitHub URL. Expected format: https://github.com/owner/repo" },
        { status: 400 }
      );
    }
    const { owner, repo } = parsed;

    const repoInfoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: githubApiHeaders(),
    });

    if (!repoInfoRes.ok) {
      if (repoInfoRes.status === 404) {
        return Response.json(
          { error: "Repository not found. Make sure it's public and the URL is correct." },
          { status: 404 }
        );
      }
      if (repoInfoRes.status === 403) {
        return Response.json(
          {
            error: GITHUB_TOKEN
              ? "GitHub API rate limit exceeded. Please try again later."
              : "GitHub API rate limit exceeded. Set a GITHUB_TOKEN environment variable to raise the limit.",
          },
          { status: 429 }
        );
      }
      return Response.json(
        { error: "Failed to reach GitHub. Please try again." },
        { status: 502 }
      );
    }

    const repoInfo = await repoInfoRes.json();
    const defaultBranch = repoInfo.default_branch || "main";

    const treeRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/trees/${defaultBranch}?recursive=1`,
      { headers: githubApiHeaders() }
    );

    if (!treeRes.ok) {
      if (treeRes.status === 403) {
        return Response.json(
          {
            error: GITHUB_TOKEN
              ? "GitHub API rate limit exceeded. Please try again later."
              : "GitHub API rate limit exceeded. Set a GITHUB_TOKEN environment variable to raise the limit.",
          },
          { status: 429 }
        );
      }
      return Response.json(
        { error: "Failed to fetch repository file tree." },
        { status: 502 }
      );
    }

    const treeData = await treeRes.json();
    const allFiles = (treeData.tree || []).filter((item) => item.type === "blob");

    const relevantFiles = allFiles.filter((item) => {
      if (isIgnored(item.path)) return false;
      if (!isSupportedExtension(item.path)) return false;
      if (item.size && item.size > MAX_FILE_SIZE_BYTES) return false;
      return true;
    });

    if (relevantFiles.length === 0) {
      return Response.json(
        { error: "No supported source files found in this repository." },
        { status: 400 }
      );
    }

    const collectedFiles = await fetchFilesInBatches(relevantFiles, owner, repo, defaultBranch);

    const successfulFiles = collectedFiles.filter(Boolean);

    if (successfulFiles.length === 0) {
      return Response.json(
        { error: "Found matching files, but couldn't read their contents." },
        { status: 502 }
      );
    }

    const parsedFiles = await parseFiles(successfulFiles);

    const contentByPath = new Map(successfulFiles.map((f) => [f.path, f.content]));
    const analysisInput = parsedFiles.map((p) => ({
      filePath: p.filePath,
      tree: p.tree,
      sourceCode: contentByPath.get(p.filePath),
    }));

    const rawFindings = analyzeFiles(analysisInput);

    const conversation = await Conversation.create({
      userId: session.user.id,
      title: `${owner}/${repo} scan`,
      type: "scan",
      scanMeta: {
        source: "github",
        repoUrl,
        fileCount: successfulFiles.length,
        findingsCount: rawFindings.length,
      }
    });

    const dbFindings = await Finding.insertMany(
      rawFindings.map(f => ({
        conversationId: conversation._id,
        vulnerabilityType: f.vulnerability_type || f.vulnerabilityType,
        severity: f.severity,
        file: f.file || ((f.path || []).find(p => p.type === 'sink') || (f.path || [])[0])?.file,
        line: f.line || ((f.path || []).find(p => p.type === 'sink') || (f.path || [])[0])?.line,
        path: f.path,
        attackerPayload: f.attacker_payload,
        fixSuggestion: f.fix_suggestion,
      }))
    );

    // Mongoose insertMany returns mongoose documents, but the frontend expects the original JSON keys
    // For compatibility with the frontend, return the findings as they were formatted before, but with the _id from the db
    const mergedFindings = rawFindings.map((f, i) => ({
      ...f,
      _id: dbFindings[i]._id.toString(),
      conversationId: conversation._id.toString()
    }));

    return Response.json({
      message: "Scan complete.",
      fileCount: successfulFiles.length,
      conversationId: conversation._id.toString(),
      findings: mergedFindings,
    });
  } catch (error) {
    console.error("Error in /api/scan/github:", error);
    return Response.json(
      { error: "Something went wrong while importing the repository." },
      { status: 500 }
    );
  }
}