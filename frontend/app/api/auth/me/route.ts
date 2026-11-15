import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    id: "usr_1",
    username: "Researcher",
    role: "Lead AI Researcher"
  });
}
