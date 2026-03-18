import {
  Timestamp,
  collection,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getDefaultEndTime } from "@/lib/utils";
import type { Guest, GuestFormValues, GuestStatus } from "@/lib/types";

const COLLECTION_NAME = "guests";

type FirestoreGuest = {
  name: string;
  company: string;
  date: string;
  time: string;
  endTime?: string;
  status: GuestStatus;
  notes?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
};

function getGuestsCollection() {
  if (!db) {
    throw new Error("Firebase is not configured. Add your .env.local values before using Firestore.");
  }

  return collection(db, COLLECTION_NAME);
}

function mapGuest(documentId: string, data: FirestoreGuest): Guest {
  return {
    id: documentId,
    name: data.name,
    company: data.company,
    date: data.date,
    time: data.time,
    endTime: data.endTime ?? getDefaultEndTime(data.time),
    status: data.status,
    notes: data.notes ?? "",
    createdAt: data.createdAt?.toDate() ?? null,
    updatedAt: data.updatedAt?.toDate() ?? null,
  };
}

async function parseMutationResponse(response: Response) {
  const data = (await response.json().catch(() => null)) as { message?: string } | null;

  if (!response.ok) {
    throw new Error(data?.message || "Unable to complete this request.");
  }
}

export function subscribeToGuests(
  onData: (guests: Guest[]) => void,
  onError: (error: Error) => void,
) {
  const guestsQuery = query(
    getGuestsCollection(),
    orderBy("date", "asc"),
    orderBy("time", "asc"),
    orderBy("name", "asc"),
  );

  return onSnapshot(
    guestsQuery,
    (snapshot) => {
      const nextGuests = snapshot.docs.map((guestDocument) =>
        mapGuest(guestDocument.id, guestDocument.data() as FirestoreGuest),
      );

      onData(nextGuests);
    },
    (error) => {
      onError(error instanceof Error ? error : new Error("Unable to sync guest data."));
    },
  );
}

export async function addGuest(input: GuestFormValues) {
  const response = await fetch("/api/guests", {
    body: JSON.stringify(input),
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  await parseMutationResponse(response);
}

export async function updateGuest(id: string, input: GuestFormValues) {
  const response = await fetch(`/api/guests/${id}`, {
    body: JSON.stringify(input),
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    method: "PATCH",
  });

  await parseMutationResponse(response);
}

export async function deleteGuest(id: string) {
  const response = await fetch(`/api/guests/${id}`, {
    credentials: "include",
    method: "DELETE",
  });

  await parseMutationResponse(response);
}
