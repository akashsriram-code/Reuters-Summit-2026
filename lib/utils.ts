import { format } from "date-fns";
import { SUMMIT_DATES } from "@/lib/types";
import type { Guest } from "@/lib/types";

export function formatDateTimeLabel(date: string, time: string) {
  return format(new Date(`${date}T${time}:00`), "EEE, MMM d 'at' h:mm a");
}

export function formatUpdatedAtLabel(updatedAt: Date | null) {
  if (!updatedAt) {
    return "just now";
  }

  return format(updatedAt, "MMM d, yyyy 'at' h:mm a");
}

export function getGuestsForDate(guests: Guest[], date: string) {
  return [...guests]
    .filter((guest) => guest.date === date)
    .sort((left, right) => left.time.localeCompare(right.time));
}

export function isAllowedSummitDate(date: string) {
  return SUMMIT_DATES.includes(date as (typeof SUMMIT_DATES)[number]);
}
