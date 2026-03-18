"use client";

import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { AlertTriangle, CalendarDays, Clock3, X } from "lucide-react";
import { SUMMIT_DAY_END_TIME, SUMMIT_DAY_START_TIME, SUMMIT_END_DATE, SUMMIT_START_DATE } from "@/lib/types";
import { formatUpdatedAtLabel, getDefaultEndTime, isAllowedSummitDate, isValidTimeRange } from "@/lib/utils";
import type { Guest, GuestFormValues, GuestStatus } from "@/lib/types";

type GuestModalProps = {
  canEdit: boolean;
  defaultDate?: string;
  defaultTime?: string;
  guest?: Guest;
  isOpen: boolean;
  isSaving: boolean;
  mode: "create" | "edit";
  onClose: () => void;
  onSubmit: (values: GuestFormValues) => Promise<void>;
};

const defaultValues: GuestFormValues = {
  company: "",
  date: SUMMIT_START_DATE,
  endTime: "10:00",
  name: "",
  notes: "",
  status: "tentative",
  time: SUMMIT_DAY_START_TIME,
};

export default function GuestModal({
  canEdit,
  defaultDate,
  defaultTime,
  guest,
  isOpen,
  isSaving,
  mode,
  onClose,
  onSubmit,
}: GuestModalProps) {
  const [formValues, setFormValues] = useState<GuestFormValues>(defaultValues);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (guest) {
      setFormValues({
        company: guest.company,
        date: guest.date,
        endTime: guest.endTime,
        name: guest.name,
        notes: guest.notes,
        status: guest.status,
        time: guest.time,
      });
      setValidationError(null);
      return;
    }

    setFormValues({
      ...defaultValues,
      date: defaultDate && isAllowedSummitDate(defaultDate) ? defaultDate : SUMMIT_START_DATE,
      time: defaultTime ?? defaultValues.time,
      endTime: defaultTime ? getDefaultEndTime(defaultTime) : defaultValues.endTime,
    });
    setValidationError(null);
  }, [defaultDate, defaultTime, guest, isOpen]);

  const modalLabel = mode === "edit" ? "Edit Guest" : "Add Guest";
  const noteCount = formValues.notes.length;

  const summitRangeLabel = useMemo(() => {
    const start = format(new Date(`${SUMMIT_START_DATE}T00:00:00`), "MMM d");
    const end = format(new Date(`${SUMMIT_END_DATE}T00:00:00`), "MMM d, yyyy");
    return `${start} - ${end}`;
  }, []);

  if (!isOpen) {
    return null;
  }

  const handleFieldChange = <T extends keyof GuestFormValues>(field: T, value: GuestFormValues[T]) => {
    setFormValues((current) => {
      if (field === "time") {
        const nextTime = value as GuestFormValues["time"];
        return {
          ...current,
          endTime: isValidTimeRange(nextTime, current.endTime)
            ? current.endTime
            : getDefaultEndTime(nextTime),
          time: nextTime,
        };
      }

      return {
        ...current,
        [field]: value,
      };
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalized: GuestFormValues = {
      company: formValues.company.trim(),
      date: formValues.date,
      endTime: formValues.endTime,
      name: formValues.name.trim(),
      notes: formValues.notes.trim(),
      status: formValues.status,
      time: formValues.time,
    };

    if (!normalized.name || !normalized.company || !normalized.date || !normalized.time || !normalized.endTime) {
      setValidationError("Please complete all required fields before saving.");
      return;
    }

    if (!isAllowedSummitDate(normalized.date)) {
      setValidationError("Guest slots can only be scheduled between May 18 and May 23, 2026.");
      return;
    }

    if (normalized.notes.length > 300) {
      setValidationError("Notes must be 300 characters or fewer.");
      return;
    }

    if (!isValidTimeRange(normalized.time, normalized.endTime)) {
      setValidationError("End time must be later than the start time.");
      return;
    }

    setValidationError(null);
    await onSubmit(normalized);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#05101b]/75 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-[2rem] border border-white/10 bg-white p-6 text-reuters-ink shadow-2xl shadow-black/30 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-reuters-stone">Guest form</p>
            <h2 className="mt-1 text-2xl font-semibold">{modalLabel}</h2>
            <p className="mt-2 text-sm text-reuters-stone">
              Summit scheduling window: {summitRangeLabel}
            </p>
          </div>
          <button
            aria-label="Close modal"
            className="rounded-full border border-reuters-line p-2 text-reuters-stone transition hover:border-reuters-red/25 hover:text-reuters-red"
            onClick={onClose}
            type="button"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {guest?.updatedAt ? (
          <div className="mt-4 rounded-2xl bg-reuters-soft px-4 py-3 text-sm text-reuters-stone">
            Last updated {formatUpdatedAtLabel(guest.updatedAt)}
          </div>
        ) : null}

        {validationError ? (
          <div className="mt-4 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{validationError}</span>
          </div>
        ) : null}

        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          <div className="grid gap-5 sm:grid-cols-3">
            <label className="space-y-2 sm:col-span-2">
              <span className="text-sm font-medium text-reuters-ink">
                Guest Full Name <span className="text-reuters-red">*</span>
              </span>
              <input
                className="field-input"
                onChange={(event) => handleFieldChange("name", event.target.value)}
                placeholder="Jane Doe"
                required
                type="text"
                value={formValues.name}
              />
            </label>

            <label className="space-y-2 sm:col-span-2">
              <span className="text-sm font-medium text-reuters-ink">
                Company / Organisation <span className="text-reuters-red">*</span>
              </span>
              <input
                className="field-input"
                onChange={(event) => handleFieldChange("company", event.target.value)}
                placeholder="Company name"
                required
                type="text"
                value={formValues.company}
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-reuters-ink">
                Date <span className="text-reuters-red">*</span>
              </span>
              <div className="relative">
                <CalendarDays className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-reuters-stone" />
                <input
                  className="field-input pl-11"
                  max={SUMMIT_END_DATE}
                  min={SUMMIT_START_DATE}
                  onChange={(event) => handleFieldChange("date", event.target.value)}
                  required
                  type="date"
                  value={formValues.date}
                />
              </div>
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-reuters-ink">
                Start Time <span className="text-reuters-red">*</span>
              </span>
              <div className="relative">
                <Clock3 className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-reuters-stone" />
                <input
                  className="field-input pl-11"
                  max={SUMMIT_DAY_END_TIME}
                  min={SUMMIT_DAY_START_TIME}
                  onChange={(event) => handleFieldChange("time", event.target.value)}
                  required
                  type="time"
                  value={formValues.time}
                />
              </div>
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-reuters-ink">
                End Time <span className="text-reuters-red">*</span>
              </span>
              <div className="relative">
                <Clock3 className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-reuters-stone" />
                <input
                  className="field-input pl-11"
                  max={SUMMIT_DAY_END_TIME}
                  min={SUMMIT_DAY_START_TIME}
                  onChange={(event) => handleFieldChange("endTime", event.target.value)}
                  required
                  type="time"
                  value={formValues.endTime}
                />
              </div>
            </label>
          </div>

          <fieldset className="space-y-3">
            <legend className="text-sm font-medium text-reuters-ink">Slot Status</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              {(["tentative", "confirmed"] as GuestStatus[]).map((status) => {
                const active = formValues.status === status;
                return (
                  <label
                    key={status}
                    className={`cursor-pointer rounded-2xl border px-4 py-3 transition ${
                      active
                        ? "border-reuters-red bg-reuters-red/5 shadow-sm"
                        : "border-reuters-line bg-white hover:border-reuters-red/20"
                    }`}
                  >
                    <input
                      checked={active}
                      className="sr-only"
                      name="status"
                      onChange={() => handleFieldChange("status", status)}
                      type="radio"
                    />
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-medium capitalize text-reuters-ink">{status}</span>
                      <span
                        className={`h-3 w-3 rounded-full ${
                          status === "confirmed" ? "bg-emerald-500" : "bg-amber-400"
                        }`}
                      />
                    </div>
                  </label>
                );
              })}
            </div>
          </fieldset>

          <label className="space-y-2">
            <span className="text-sm font-medium text-reuters-ink">Notes</span>
            <textarea
              className="field-input min-h-28 resize-none"
              maxLength={300}
              onChange={(event) => handleFieldChange("notes", event.target.value)}
              placeholder="Optional notes for the planning team"
              value={formValues.notes}
            />
            <div className="text-right text-xs text-reuters-stone">{noteCount}/300</div>
          </label>

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <button
              className="rounded-full border border-reuters-line px-5 py-3 text-sm font-medium text-reuters-stone transition hover:border-reuters-red/20 hover:text-reuters-red"
              onClick={onClose}
              type="button"
            >
              Cancel
            </button>
            <button
              className="rounded-full bg-reuters-red px-5 py-3 text-sm font-medium text-white transition hover:bg-reuters-red-dark disabled:cursor-not-allowed disabled:opacity-70"
              disabled={isSaving || !canEdit}
              type="submit"
            >
              {!canEdit
                ? "Editing Locked"
                : isSaving
                  ? "Saving..."
                  : mode === "edit"
                    ? "Save Changes"
                    : "Create Guest Slot"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
