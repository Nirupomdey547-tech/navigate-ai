import { NextResponse } from "next/server";
import { getRun } from "@/lib/navigationEngine";

export async function GET(req: Request, { params }: { params: Promise<{ runId: string }> }) {
  const { runId } = await params;
  const run = getRun(runId);
  if (!run) return NextResponse.json({ detail: "Run not found" }, { status: 404 });
  return NextResponse.json(run);
}
