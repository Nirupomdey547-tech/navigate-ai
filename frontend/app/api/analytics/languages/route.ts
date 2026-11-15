import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json([
    { language: "English (en)", code: "en", count: 120, sr: 81.2, spl: 74.5 },
    { language: "Hindi (hi)", code: "hi", count: 94, sr: 76.8, spl: 69.4 },
    { language: "Telugu (te)", code: "te", count: 70, sr: 75.1, spl: 68.2 }
  ]);
}
