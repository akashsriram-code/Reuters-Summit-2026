export type EditorSessionState = {
  isEditor: boolean;
};

async function parseResponse(response: Response) {
  const data = (await response.json().catch(() => null)) as { message?: string } | null;

  if (!response.ok) {
    throw new Error(data?.message || "Request failed.");
  }

  return data;
}

export async function getEditorSessionState() {
  const response = await fetch("/api/auth/session", {
    cache: "no-store",
    credentials: "include",
  });

  const data = (await response.json()) as EditorSessionState;
  return data;
}

export async function unlockEditing(password: string) {
  const response = await fetch("/api/auth/unlock", {
    body: JSON.stringify({ password }),
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  await parseResponse(response);
}

export async function lockEditing() {
  const response = await fetch("/api/auth/logout", {
    credentials: "include",
    method: "POST",
  });

  await parseResponse(response);
}
