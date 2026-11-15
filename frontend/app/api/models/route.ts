import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json([
    { id: "vln_xlm_roberta_v2", name: "Multilingual Decision Policy v2.1", type: "XLM-RoBERTa", parameters: "125M", val_sr: 82.4, status: "active" },
    { id: "vln_mbert_baseline", name: "mBERT Spatial Transformer", type: "mBERT", parameters: "110M", val_sr: 74.2, status: "archived" }
  ]);
}
