import { NextResponse } from "next/server";
import { hasEditorSession } from "@/lib/serverAuth";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({ isEditor: await hasEditorSession() });
}
