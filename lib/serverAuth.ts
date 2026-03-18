import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const EDITOR_SESSION_COOKIE = "reuters_summit_editor";

function getSessionSecret() {
  const secret = process.env.EDITOR_SESSION_SECRET;

  if (!secret) {
    throw new Error("Missing EDITOR_SESSION_SECRET environment variable.");
  }

  return secret;
}

function signPayload(payload: string) {
  return createHmac("sha256", getSessionSecret()).update(payload).digest("base64url");
}

export function createEditorSessionToken() {
  const payload = Buffer.from(
    JSON.stringify({
      role: "editor",
      issuedAt: Date.now(),
    }),
  ).toString("base64url");

  return `${payload}.${signPayload(payload)}`;
}

export function verifyEditorSessionToken(token: string | undefined) {
  if (!token) {
    return false;
  }

  const [payload, signature] = token.split(".");

  if (!payload || !signature) {
    return false;
  }

  const expectedSignature = signPayload(payload);
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (signatureBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return timingSafeEqual(signatureBuffer, expectedBuffer);
}

export async function hasEditorSession() {
  const cookieStore = await cookies();
  return verifyEditorSessionToken(cookieStore.get(EDITOR_SESSION_COOKIE)?.value);
}

export function isEditorPasswordValid(password: string) {
  const expectedPassword = process.env.EDITOR_SHARED_PASSWORD;

  if (!expectedPassword) {
    throw new Error("Missing EDITOR_SHARED_PASSWORD environment variable.");
  }

  return password === expectedPassword;
}
