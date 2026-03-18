export type GuestStatus = "tentative" | "confirmed";
export type DashboardTab = "calendar" | "guests";

export type Guest = {
  id: string;
  name: string;
  company: string;
  date: string;
  time: string;
  status: GuestStatus;
  notes: string;
  createdAt: Date | null;
  updatedAt: Date | null;
};

export type GuestFormValues = {
  name: string;
  company: string;
  date: string;
  time: string;
  status: GuestStatus;
  notes: string;
};

export type EditorSessionState = {
  isEditor: boolean;
};

export const SUMMIT_START_DATE = "2026-05-18";
export const SUMMIT_END_DATE = "2026-05-23";

export const SUMMIT_DATES = [
  "2026-05-18",
  "2026-05-19",
  "2026-05-20",
  "2026-05-21",
  "2026-05-22",
  "2026-05-23",
] as const;
