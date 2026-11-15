import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    total_episodes: 284,
    success_rate: 78.4,
    spl: 71.2,
    ndtw: 82.5,
    avg_steps: 5.4
  });
}
