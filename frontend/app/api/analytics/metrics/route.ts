import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json([
    { step: 1, spl: 98, ndtw: 99, entropy: 0.05 },
    { step: 2, spl: 94, ndtw: 96, entropy: 0.11 },
    { step: 3, spl: 88, ndtw: 92, entropy: 0.18 },
    { step: 4, spl: 85, ndtw: 89, entropy: 0.22 },
    { step: 5, spl: 82, ndtw: 87, entropy: 0.25 }
  ]);
}
