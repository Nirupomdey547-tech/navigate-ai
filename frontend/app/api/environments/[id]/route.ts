import { NextResponse } from "next/server";
import { getEnvironmentById } from "@/lib/navigationEngine";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const env = getEnvironmentById(id);
  if (!env) return NextResponse.json({ detail: "Environment not found" }, { status: 404 });
  return NextResponse.json(env);
}
