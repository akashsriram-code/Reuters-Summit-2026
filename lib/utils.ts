import { format } from "date-fns";
import { SUMMIT_DATES, SUMMIT_DAY_END_TIME } from "@/lib/types";
import type { Guest } from "@/lib/types";

export function formatDateTimeLabel(date: string, time: string, endTime?: string) {
  const startLabel = format(new Date(`${date}T${time}:00`), "EEE, MMM d 'at' h:mm a");

  if (!endTime) {
    return startLabel;
  }

  return `${startLabel} - ${format(new Date(`${date}T${endTime}:00`), "h:mm a")}`;
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

export function timeToMinutes(time: string) {
  const [hours, minutes] = time.split(":").map((segment) => Number.parseInt(segment, 10));
  return hours * 60 + minutes;
}

export function minutesToTime(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
}

export function getDefaultEndTime(startTime: string) {
  const oneHourLater = timeToMinutes(startTime) + 60;
  const summitEndMinutes = timeToMinutes(SUMMIT_DAY_END_TIME);
  return minutesToTime(Math.min(oneHourLater, summitEndMinutes));
}

export function isValidTimeRange(startTime: string, endTime: string) {
  return timeToMinutes(endTime) > timeToMinutes(startTime);
}

export function addMinutesToTime(startTime: string, minutesToAdd: number, maxTime?: string) {
  const nextMinutes = timeToMinutes(startTime) + minutesToAdd;

  if (!maxTime) {
    return minutesToTime(nextMinutes);
  }

  return minutesToTime(Math.min(nextMinutes, timeToMinutes(maxTime)));
}
