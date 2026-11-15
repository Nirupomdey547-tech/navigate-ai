import { NextResponse } from "next/server";
import { getInstructionsForEnv } from "@/lib/navigationEngine";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const lang = searchParams.get("language") || undefined;
  const instructions = getInstructionsForEnv(id, lang);
  return NextResponse.json(instructions);
}
