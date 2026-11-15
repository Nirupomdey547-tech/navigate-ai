import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json([
    { id: "office_floor", name: "Global Tech Research Lab", episodes: 82, sr: 84.1 },
    { id: "residential_apartment", name: "Contemporary Penthouse", episodes: 75, sr: 81.3 },
    { id: "hotel_corridor", name: "Grand Horizon Luxury Hotel", episodes: 54, sr: 75.9 },
    { id: "university_building", name: "Turing Science Complex", episodes: 41, sr: 70.7 },
    { id: "multi_room_indoor", name: "Deep Research Outpost", episodes: 32, sr: 68.8 }
  ]);
}
