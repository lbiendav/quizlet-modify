import { NextResponse } from "next/server";

import { getFileFromS3 } from "~/lib/aws";

export async function GET(
  _request: Request,
  { params }: { params: { key: string } },
) {
  try {
    const object = await getFileFromS3(params.key);
    if (!object.Body) return new NextResponse(null, { status: 404 });

    const body = await object.Body.transformToByteArray();
    return new NextResponse(body, {
      headers: {
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Type": object.ContentType ?? "application/octet-stream",
      },
    });
  } catch {
    return new NextResponse(null, { status: 404 });
  }
}
