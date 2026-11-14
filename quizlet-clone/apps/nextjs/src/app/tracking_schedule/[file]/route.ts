import { readFile } from "node:fs/promises";
import path from "node:path";

const TRACKING_FILES = {
  "diem-danh.html": "text/html; charset=utf-8",
  "diem-danh-data.js": "text/javascript; charset=utf-8",
  "diem-danh-inferno.css": "text/css; charset=utf-8",
} as const;

type TrackingFile = keyof typeof TRACKING_FILES;

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: { file: string } },
) {
  if (!(params.file in TRACKING_FILES)) {
    return new Response("Not found", { status: 404 });
  }

  const file = params.file as TrackingFile;
  const filePath = path.join(
    process.cwd(),
    "..",
    "..",
    "tracking_schedule",
    file,
  );

  try {
    const content = await readFile(filePath);

    return new Response(content, {
      headers: {
        "Cache-Control": "no-store",
        "Content-Type": TRACKING_FILES[file],
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response("Tracking schedule file not found", { status: 404 });
  }
}
