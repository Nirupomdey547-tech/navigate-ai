import { NextResponse } from "next/server";
import { startRun } from "@/lib/navigationEngine";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const run = startRun(body);
    return NextResponse.json({
      run_id: run.run_id,
      environment_id: run.environment_id,
      status: run.status,
      start_node: run.start_node,
      goal_node: run.goal_node,
      current_node: run.current_node,
      path_traveled: run.path_traveled,
      step: run.step,
      max_steps: run.max_steps,
      instruction: run.instruction,
      language: run.language
    });
  } catch (err: any) {
    return NextResponse.json({ detail: err.message }, { status: 400 });
  }
}
