import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json([
    { run_id: "run_101", environment: "residential_apartment", goal: "kitchen", steps: 4, success: true, spl: 94.2, date: "2026-11-15" },
    { run_id: "run_102", environment: "office_floor", goal: "conference_glass", steps: 5, success: true, spl: 89.1, date: "2026-11-15" }
  ]);
}
