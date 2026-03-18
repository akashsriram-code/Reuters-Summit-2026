"use client";

import { useMemo, useState } from "react";
import { format, isToday } from "date-fns";
import { CalendarPlus2, Clock3, LockKeyhole, PencilLine, Plus, Trash2 } from "lucide-react";
import EmptyState from "@/app/components/EmptyState";
import LoadingSpinner from "@/app/components/LoadingSpinner";
import StatusBadge from "@/app/components/StatusBadge";
import { SUMMIT_DATES } from "@/lib/types";
import { formatDateTimeLabel, formatUpdatedAtLabel, getGuestsForDate } from "@/lib/utils";
import type { Guest } from "@/lib/types";

type CalendarViewProps = {
  canEdit: boolean;
  guests: Guest[];
  loading: boolean;
  onAddGuest: () => void;
  onAddGuestForDate: (date: string, time?: string) => void;
  onDeleteGuest: (guest: Guest) => Promise<void>;
  onEditGuest: (guest: Guest) => void;
  onMoveGuest: (guest: Guest, date: string, time: string) => Promise<void>;
  onRequestUnlock: () => void;
};

const HOURS = Array.from({ length: 10 }, (_, index) => index + 9);

function formatHourLabel(hour: number) {
  return format(new Date(2026, 4, 18, hour, 0, 0), "h a");
}

function guestMatchesHour(guest: Guest, hour: number) {
  const guestHour = Number.parseInt(guest.time.split(":")[0] ?? "0", 10);
  return guestHour === hour;
}

export default function CalendarView({
  canEdit,
  guests,
  loading,
  onAddGuest,
  onAddGuestForDate,
  onDeleteGuest,
  onEditGuest,
  onMoveGuest,
  onRequestUnlock,
}: CalendarViewProps) {
  const [selectedDate, setSelectedDate] = useState<string>(SUMMIT_DATES[0]);
  const [draggingGuestId, setDraggingGuestId] = useState<string | null>(null);

  const guestsByDate = useMemo(() => {
    return Object.fromEntries(SUMMIT_DATES.map((date) => [date, getGuestsForDate(guests, date)]));
  }, [guests]);

  const hasGuests = guests.length > 0;

  return (
    <section className="p-5 xl:p-6">
      <div className="space-y-5">
        <div className="flex flex-col gap-4 rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-white/45">Summit schedule</p>
            <h3 className="mt-1 text-2xl font-semibold text-white">May 18-23, 2026</h3>
            <p className="mt-2 text-sm text-white/55">
              Click any hour block to add a slot. Existing bookings stay visible in the live calendar.
            </p>
          </div>
          <button
            className="inline-flex items-center justify-center gap-2 rounded-full bg-reuters-red px-4 py-3 text-sm font-medium text-white transition hover:bg-reuters-red-dark"
            onClick={canEdit ? onAddGuest : onRequestUnlock}
            type="button"
          >
            {canEdit ? <CalendarPlus2 className="h-4 w-4" /> : <LockKeyhole className="h-4 w-4" />}
            {canEdit ? "+ Add Guest" : "Unlock Editing"}
          </button>
        </div>

        {!canEdit ? (
          <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/65">
            The calendar is live for everyone to view. Unlock editing to create, update, or delete slots.
          </div>
        ) : null}

        {loading ? (
          <div className="card-surface flex min-h-80 items-center justify-center">
            <LoadingSpinner label="Loading summit calendar" />
          </div>
        ) : (
          <div className="card-surface overflow-hidden p-0">
            <div className="overflow-x-auto">
              <div className="grid min-w-[1120px] grid-cols-[84px_repeat(6,minmax(170px,1fr))]">
                <div className="border-b border-white/10 bg-[#131D31]" />
                {SUMMIT_DATES.map((date) => {
                  const dayDate = new Date(`${date}T00:00:00`);
                  const active = selectedDate === date;

                  return (
                    <button
                      key={date}
                      className={`border-b border-l border-white/10 px-4 py-4 text-left transition ${
                        active ? "bg-white/[0.08]" : "bg-[#131D31] hover:bg-white/[0.05]"
                      }`}
                      onClick={() => setSelectedDate(date)}
                      type="button"
                    >
                      <div className="text-[11px] uppercase tracking-[0.26em] text-white/45">
                        {format(dayDate, "EEE")}
                      </div>
                      <div className="mt-2 flex items-center gap-3">
                        <span className="text-2xl font-semibold text-white">{format(dayDate, "d")}</span>
                        <div>
                          <div className="text-sm font-medium text-white">{format(dayDate, "MMM")}</div>
                          {isToday(dayDate) ? (
                            <div className="text-xs text-reuters-red">Today</div>
                          ) : (
                            <div className="text-xs text-white/45">{guestsByDate[date]?.length ?? 0} slots</div>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}

                {HOURS.map((hour) => (
                  <div key={hour} className="contents">
                    <div className="flex items-start justify-end border-b border-white/10 bg-[#10192B] px-4 py-4 text-xs font-medium uppercase tracking-[0.18em] text-white/40">
                      {formatHourLabel(hour)}
                    </div>

                    {SUMMIT_DATES.map((date) => {
                      const slotTime = `${hour.toString().padStart(2, "0")}:00`;
                      const hourGuests = (guestsByDate[date] ?? []).filter((guest) =>
                        guestMatchesHour(guest, hour),
                      );

                      return (
                        <button
                          key={`${date}-${slotTime}`}
                          className={`relative min-h-[96px] border-b border-l border-white/10 px-2 py-2 text-left transition ${
                            selectedDate === date
                              ? "bg-white/[0.05] hover:bg-white/[0.08]"
                              : "bg-transparent hover:bg-white/[0.04]"
                          } ${draggingGuestId ? "hover:border-reuters-red/30" : ""}`}
                          onClick={() => {
                            setSelectedDate(date);
                            if (canEdit) {
                              onAddGuestForDate(date, slotTime);
                            } else {
                              onRequestUnlock();
                            }
                          }}
                          onDragOver={(event) => {
                            if (!canEdit) {
                              return;
                            }

                            event.preventDefault();
                          }}
                          onDrop={(event) => {
                            if (!canEdit) {
                              onRequestUnlock();
                              return;
                            }

                            event.preventDefault();
                            setDraggingGuestId(null);
                            const guestId = event.dataTransfer.getData("text/plain");
                            const guest = guests.find((item) => item.id === guestId);

                            if (!guest) {
                              return;
                            }

                            void onMoveGuest(guest, date, slotTime);
                          }}
                          type="button"
                        >
                          <div className="pointer-events-none absolute inset-x-2 top-2 flex items-center justify-between">
                            <span className="text-[10px] uppercase tracking-[0.22em] text-white/20">
                              {slotTime}
                            </span>
                            <span className="rounded-full border border-white/10 bg-white/[0.04] p-1 text-white/35">
                              <Plus className="h-3 w-3" />
                            </span>
                          </div>

                          <div className="mt-6 space-y-2">
                            {hourGuests.map((guest) => (
                              <div
                                key={guest.id}
                                draggable={canEdit}
                                className={`rounded-2xl border px-3 py-2 shadow-lg shadow-black/10 ${
                                  guest.status === "confirmed"
                                    ? "border-emerald-300/25 bg-emerald-400/65 text-slate-950"
                                    : "border-amber-200/25 bg-amber-300/75 text-slate-950"
                                }`}
                                onDragEnd={() => setDraggingGuestId(null)}
                                onDragStart={(event) => {
                                  if (!canEdit) {
                                    return;
                                  }

                                  setDraggingGuestId(guest.id);
                                  event.dataTransfer.effectAllowed = "move";
                                  event.dataTransfer.setData("text/plain", guest.id);
                                }}
                                onClick={(event) => event.stopPropagation()}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="min-w-0">
                                    <p className="truncate text-sm font-semibold">{guest.name}</p>
                                    <p className="truncate text-xs opacity-75">{guest.company}</p>
                                  </div>
                                  <StatusBadge status={guest.status} />
                                </div>
                                <div className="mt-2 flex items-center gap-2 text-xs opacity-80">
                                  <Clock3 className="h-3.5 w-3.5" />
                                  <span>{formatDateTimeLabel(guest.date, guest.time, guest.endTime)}</span>
                                </div>
                                <div className="mt-3 flex items-center justify-end gap-2">
                                  <button
                                    aria-label={`Edit ${guest.name}`}
                                    className="rounded-full border border-black/10 bg-black/5 p-1.5 text-slate-900 transition hover:bg-black/10 disabled:cursor-not-allowed disabled:opacity-40"
                                    disabled={!canEdit}
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      if (canEdit) {
                                        onEditGuest(guest);
                                      } else {
                                        onRequestUnlock();
                                      }
                                    }}
                                    type="button"
                                  >
                                    <PencilLine className="h-3.5 w-3.5" />
                                  </button>
                                  <button
                                    aria-label={`Delete ${guest.name}`}
                                    className="rounded-full border border-black/10 bg-black/5 p-1.5 text-slate-900 transition hover:bg-black/10 disabled:cursor-not-allowed disabled:opacity-40"
                                    disabled={!canEdit}
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      if (canEdit) {
                                        void onDeleteGuest(guest);
                                      } else {
                                        onRequestUnlock();
                                      }
                                    }}
                                    type="button"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                                <div className="mt-2 text-[10px] uppercase tracking-[0.18em] opacity-60">
                                  Updated {formatUpdatedAtLabel(guest.updatedAt)}
                                </div>
                              </div>
                            ))}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {!loading && !hasGuests ? <EmptyState compact /> : null}
      </div>
    </section>
  );
}
