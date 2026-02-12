import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json(
                { error: "No file uploaded" },
                { status: 400 }
            );
        }

        // Validate file type
        if (!file.type.startsWith("image/")) {
            return NextResponse.json(
                { error: "Only image files are allowed" },
                { status: 400 }
            );
        }

        // Convert file to buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Generate unique filename
        const timestamp = Date.now();
        const originalName = file.name.replace(/\s+/g, "-");
        const filename = `${timestamp}-${originalName}`;

        // Ensure uploads directory exists
        const uploadsDir = path.join(process.cwd(), "public", "uploads", "wineries");
        try {
            await mkdir(uploadsDir, { recursive: true });
        } catch (error) {
            // Directory might already exist, ignore error
        }

        // Save file
        const filepath = path.join(uploadsDir, filename);
        await writeFile(filepath, buffer);

        // Return public URL
        const url = `/uploads/wineries/${filename}`;

        return NextResponse.json({ url }, { status: 200 });
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json(
            { error: "Failed to upload file" },
            { status: 500 }
        );
    }
}
