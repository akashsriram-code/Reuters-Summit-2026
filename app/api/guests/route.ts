import { NextResponse } from "next/server";
import { FieldValue, getAdminDb } from "@/lib/firebaseAdmin";
import { ensureEditorSession } from "@/lib/apiGuards";
import type { GuestFormValues, GuestStatus } from "@/lib/types";

export const runtime = "nodejs";

const allowedStatuses = new Set<GuestStatus>(["tentative", "confirmed"]);

function validateGuest(values: GuestFormValues) {
  if (!values.name.trim() || !values.company.trim() || !values.date || !values.time) {
    return "Please complete all required fields before saving.";
  }

  if (!allowedStatuses.has(values.status)) {
    return "Invalid guest status.";
  }

  if (values.notes.length > 300) {
    return "Notes must be 300 characters or fewer.";
  }

  return null;
}

export async function POST(request: Request) {
  const unauthorizedResponse = await ensureEditorSession();
  if (unauthorizedResponse) {
    return unauthorizedResponse;
  }

  const body = (await request.json().catch(() => null)) as GuestFormValues | null;

  if (!body) {
    return NextResponse.json({ message: "Invalid request payload." }, { status: 400 });
  }

  const validationError = validateGuest(body);
  if (validationError) {
    return NextResponse.json({ message: validationError }, { status: 400 });
  }

  await getAdminDb().collection("guests").add({
    ...body,
    company: body.company.trim(),
    createdAt: FieldValue.serverTimestamp(),
    name: body.name.trim(),
    notes: body.notes.trim(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  return NextResponse.json({ success: true });
}
