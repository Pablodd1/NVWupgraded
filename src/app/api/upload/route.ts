import { NextRequest, NextResponse } from "next/server";

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

        // ImgBB API call
        // Using the key from the lib/fileUpload utility or env
        const apiKey = process.env.IMGBB_API_KEY || "812b8a2ed8cf66bebd06276bf07e119f";
        
        const imgbbFormData = new FormData();
        imgbbFormData.append("image", file);

        const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
            method: "POST",
            body: imgbbFormData
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("ImgBB error:", errorData);
            return NextResponse.json(
                { error: "Failed to upload to image host" },
                { status: 502 }
            );
        }

        const data = await response.json();
        const url = data.data.url;

        return NextResponse.json({ url }, { status: 200 });
    } catch (error: any) {
        console.error("Upload error:", error);
        return NextResponse.json(
            { error: "Failed to upload file: " + error.message },
            { status: 500 }
        );
    }
}
