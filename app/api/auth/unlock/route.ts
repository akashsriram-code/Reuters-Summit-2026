import { NextResponse } from "next/server";
import { createEditorSessionToken, EDITOR_SESSION_COOKIE, isEditorPasswordValid } from "@/lib/serverAuth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { password?: string } | null;
  const password = body?.password?.trim();

  if (!password) {
    return NextResponse.json({ message: "Enter the shared editor password." }, { status: 400 });
  }

  if (!isEditorPasswordValid(password)) {
    return NextResponse.json({ message: "Incorrect password. Please try again." }, { status: 401 });
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set({
    httpOnly: true,
    name: EDITOR_SESSION_COOKIE,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    value: createEditorSessionToken(),
  });

  return response;
}
