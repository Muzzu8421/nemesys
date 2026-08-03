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

    return Response.json({
      message: "Files received and parsed successfully.",
      fileCount: parsedFiles.length,
      files: parsedFiles.map((f) => ({ path: f.filePath, grammar: f.grammar })),
      skipped,
    });
  } catch (error) {
    console.error("Error in /api/scan/upload:", error);
    return Response.json(
      { error: "Something went wrong while processing the upload." },
      { status: 500 }
    );
  }
}
