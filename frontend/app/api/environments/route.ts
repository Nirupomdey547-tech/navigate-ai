import { NextResponse } from "next/server";
import { getAllEnvironments, registerCustomEnvironment } from "@/lib/navigationEngine";

export async function GET() {
  return NextResponse.json(getAllEnvironments());
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const env = registerCustomEnvironment(data);
    return NextResponse.json(env);
  } catch (err: any) {
    return NextResponse.json({ detail: err.message }, { status: 400 });
  }
}
