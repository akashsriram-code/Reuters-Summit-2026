import { NextResponse } from "next/server";
import { EDITOR_SESSION_COOKIE } from "@/lib/serverAuth";

export const runtime = "nodejs";

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.set({
    httpOnly: true,
    maxAge: 0,
    name: EDITOR_SESSION_COOKIE,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    value: "",
  });

  return response;
}
