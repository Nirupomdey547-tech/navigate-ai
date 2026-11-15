import { NextResponse } from "next/server";
import { getRun } from "@/lib/navigationEngine";

export async function POST(req: Request, { params }: { params: Promise<{ runId: string }> }) {
  const { runId } = await params;
  const body = await req.json();
  const run = getRun(runId);
  if (run && body.target_node) {
    run.current_node = body.target_node;
    run.path_traveled.push(body.target_node);
    run.step += 1;
  }
  return NextResponse.json({ status: "intervened", current_node: run?.current_node });
}
