import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  return NextResponse.json({
    access_token: "mock_jwt_token_" + Date.now(),
    token_type: "bearer",
    user: { id: "usr_1", username: body.username || "New User", role: "Researcher" }
  });
}
