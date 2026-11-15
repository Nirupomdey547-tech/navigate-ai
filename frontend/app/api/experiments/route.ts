import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json([
    { id: "exp_01", name: "XLM-RoBERTa Baseline", split: "val_unseen", sr: 76.5, spl: 69.8, status: "completed" },
    { id: "exp_02", name: "Cross-Modal Attention + Saliency", split: "val_unseen", sr: 82.4, spl: 75.1, status: "completed" },
    { id: "exp_03", name: "Zero-Shot Multilingual Telugu", split: "val_unseen", sr: 74.8, spl: 67.2, status: "completed" }
  ]);
}
