import { NextResponse } from "next/server";
import { hasEditorSession } from "@/lib/serverAuth";

export async function ensureEditorSession() {
  const allowed = await hasEditorSession();

  if (!allowed) {
    return NextResponse.json({ message: "Editing is locked. Unlock editing to continue." }, { status: 401 });
  }

  return null;
}
