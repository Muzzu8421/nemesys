import { parseFiles } from "../../../../core/parser";

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

export async function POST(request) {
  try {
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
      headers: { Accept: "application/vnd.github+json" },
    });

    if (!repoInfoRes.ok) {
      if (repoInfoRes.status === 404) {
        return Response.json(
          { error: "Repository not found. Make sure it's public and the URL is correct." },
          { status: 404 }
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
      { headers: { Accept: "application/vnd.github+json" } }
    );

    if (!treeRes.ok) {
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

    const collectedFiles = await Promise.all(
      relevantFiles.map(async (item) => {
        const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${defaultBranch}/${item.path}`;
        const res = await fetch(rawUrl);
        if (!res.ok) return null;
        const content = await res.text();
        return { path: item.path, content, size: item.size };
      })
    );

    const successfulFiles = collectedFiles.filter(Boolean);

    if (successfulFiles.length === 0) {
      return Response.json(
        { error: "Found matching files, but couldn't read their contents." },
        { status: 502 }
      );
    }

    const parsedFiles = await parseFiles(successfulFiles);

    return Response.json({
      message: "Repository files fetched and parsed successfully.",
      fileCount: parsedFiles.length,
      files: parsedFiles.map((f) => ({ path: f.filePath, grammar: f.grammar })),
    });
  } catch (error) {
    console.error("Error in /api/scan/github:", error);
    return Response.json(
      { error: "Something went wrong while importing the repository." },
      { status: 500 }
    );
  }
}
