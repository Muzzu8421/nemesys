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
const MAX_FILE_SIZE_BYTES = 500 * 1024; // 500KB

function isIgnored(filePath) {
  const normalizedPath = filePath.replace(/\\/g, '/');
  return IGNORED_PATTERNS.some((pattern) => normalizedPath.includes(pattern));
}

function isSupportedExtension(filePath) {
  return SUPPORTED_EXTENSIONS.some((ext) => filePath.endsWith(ext));
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    await connectToDatabase();

    const formData = await request.formData();
    const uploadedFiles = formData.getAll("files");

    if (!uploadedFiles || uploadedFiles.length === 0) {
      return Response.json(
        { error: "No files were uploaded." },
        { status: 400 }
      );
    }

    const collectedFiles = [];
    const skipped = [];

    for (const file of uploadedFiles) {
      const filePath = file.name;

      if (isIgnored(filePath)) {
        continue;
      }

      if (!isSupportedExtension(filePath)) {
        skipped.push({ file: filePath, reason: "unsupported extension" });
        continue;
      }

      if (file.size > MAX_FILE_SIZE_BYTES) {
        skipped.push({ file: filePath, reason: "file too large" });
        continue;
      }

      const content = await file.text();

      collectedFiles.push({
        path: filePath,
        content,
        size: file.size,
      });
    }

    if (collectedFiles.length === 0) {
      return Response.json(
        { error: "No supported source files found in the upload." },
        { status: 400 }
      );
    }

    const parsedFiles = await parseFiles(collectedFiles);

    const contentByPath = new Map(collectedFiles.map((f) => [f.path, f.content]));
    const analysisInput = parsedFiles.map((p) => ({
      filePath: p.filePath,
      tree: p.tree,
      sourceCode: contentByPath.get(p.filePath),
    }));

    const rawFindings = analyzeFiles(analysisInput);

    const conversation = await Conversation.create({
      userId: session.user.id,
      title: `Local upload scan`,
      type: "scan",
      scanMeta: {
        source: "upload",
        fileCount: collectedFiles.length,
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

    const mergedFindings = rawFindings.map((f, i) => ({
      ...f,
      _id: dbFindings[i]._id.toString(),
      conversationId: conversation._id.toString()
    }));

    return Response.json({
      message: "Scan complete.",
      fileCount: collectedFiles.length,
      conversationId: conversation._id.toString(),
      findings: mergedFindings,
    });
  } catch (error) {
    console.error("Error in /api/scan/upload:", error);
    return Response.json(
      { error: "Something went wrong while processing the upload." },
      { status: 500 }
    );
  }
}

