import { NextResponse } from "next/server";
import { getRun } from "@/lib/navigationEngine";

export async function POST(req: Request, { params }: { params: Promise<{ runId: string }> }) {
  const { runId } = await params;
  const run = getRun(runId);
  if (run) {
    run.step = 0;
    run.current_node = run.start_node;
    run.path_traveled = [run.start_node];
    run.is_done = false;
    run.success = false;
    run.status = "running";
  }
  return NextResponse.json({ status: "reset", current_node: run?.start_node });
}
