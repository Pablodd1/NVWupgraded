import { NextResponse } from "next/server";
import { removeToken } from "@/lib/auth";

export async function GET(req: Request) {
  await removeToken();
  return NextResponse.json({ success: true, message: "Logged out" });
}
