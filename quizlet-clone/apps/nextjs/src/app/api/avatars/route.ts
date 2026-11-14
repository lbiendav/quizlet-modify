import { NextResponse } from "next/server";

import { auth } from "@acme/auth";

import { uploadObject } from "~/lib/aws";

const MAX_AVATAR_BYTES = 5 * 1024 * 1024;

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File) || !file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Invalid image" }, { status: 400 });
  }

  if (file.size > MAX_AVATAR_BYTES) {
    return NextResponse.json({ error: "Image exceeds 5 MB" }, { status: 413 });
  }

  try {
    return NextResponse.json(await uploadObject(file));
  } catch (error) {
    console.error("Avatar upload failed", error);
    return NextResponse.json(
      { error: "Avatar storage is unavailable" },
      { status: 503 },
    );
  }
}
