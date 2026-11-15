import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "online",
    model: "XLM-RoBERTa + Cross-Modal Cross-Attention Decision Policy",
    languages: ["en", "hi", "te"],
    active_environment: "residential_apartment",
    benchmark_version: "RxR-v1.4"
  });
}
