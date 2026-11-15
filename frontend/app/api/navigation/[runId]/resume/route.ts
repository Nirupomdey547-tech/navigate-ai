import { NextResponse } from "next/server";
import { getRun } from "@/lib/navigationEngine";

export async function POST(req: Request, { params }: { params: Promise<{ runId: string }> }) {
  const { runId } = await params;
  const run = getRun(runId);
  if (run) run.status = "running";
  return NextResponse.json({ status: "running" });
}
