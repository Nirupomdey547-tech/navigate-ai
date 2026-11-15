import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    total_episodes: 284,
    success_rate: 78.4,
    spl: 71.2,
    ndtw: 82.5,
    avg_steps: 5.4,
    languages: {
      en: { count: 120, sr: 81.2, spl: 74.5 },
      hi: { count: 94, sr: 76.8, spl: 69.4 },
      te: { count: 70, sr: 75.1, spl: 68.2 }
    }
  });
}
