import { NextResponse } from "next/server";
import { stepRun } from "@/lib/navigationEngine";

export async function POST(req: Request, { params }: { params: Promise<{ runId: string }> }) {
  try {
    const { runId } = await params;
    const res = stepRun(runId);
    return NextResponse.json(res);
  } catch (err: any) {
    return NextResponse.json({ detail: err.message }, { status: 400 });
  }
}
