import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  const text = (body.instruction || "").toLowerCase();

  const knownLandmarks = [
    "refrigerator", "fridge", "sofa", "table", "desk", "bed", "counter",
    "foyer", "hallway", "kitchen", "bedroom", "bathroom", "balcony",
    "door", "elevator", "stairs", "plants", "lamp"
  ];
  const detected = knownLandmarks.filter(lm => text.includes(lm));

  return NextResponse.json({
    instruction: body.instruction,
    language: body.language || "en",
    detected_landmarks: detected.length > 0 ? detected : ["corridor", "hallway"],
    subgoals: [
      "Navigate past entrance corridor",
      "Head towards target area",
      "Stop at destination"
    ],
    tokens: body.instruction.split(/\s+/),
    confidence: 0.92
  });
}
