import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Only allow images
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Only image files are allowed" },
        { status: 400 }
      );
    }

    // File size guard (5 MB max)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "File exceeds 5 MB limit" },
        { status: 400 }
      );
    }

    const apiKey = process.env.IMGBB_API_KEY;
    if (!apiKey) {
      console.error("IMGBB_API_KEY is not configured");
      return NextResponse.json(
        { error: "Image upload service is not configured. Contact support." },
        { status: 500 }
      );
    }

    const imgbbFormData = new FormData();
    imgbbFormData.append("image", file);

    const response = await fetch(
      `https://api.imgbb.com/1/upload?key=${apiKey}`,
      { method: "POST", body: imgbbFormData }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("ImgBB upload error:", errorData);
      return NextResponse.json(
        { error: "Failed to upload to image host" },
        { status: 502 }
      );
    }

    const data = await response.json();
    const url: string = data?.data?.url;

    if (!url) {
      return NextResponse.json(
        { error: "Image host returned no URL" },
        { status: 502 }
      );
    }

    return NextResponse.json({ url }, { status: 200 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("Upload error:", msg);
    return NextResponse.json(
      { error: "Failed to upload file: " + msg },
      { status: 500 }
    );
  }
}
