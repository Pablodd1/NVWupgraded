import { NextResponse } from "next/server";

export async function POST(req: any) {
  try {
    const body = await req.json();
    const response = await fetch("https://api-flask.winesnvw.com/process", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body), // Forward the incoming request body to Flask
    });

    const data = await response.json();

    if (response.ok) {
      return NextResponse.json(data, { status: 200 });
    } else {
      return NextResponse.json({ error: "Error processing request" }, { status: response.status });
    }
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
