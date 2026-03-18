"use client";

import { useMemo, useState } from "react";
import { ArrowUpDown, LockKeyhole, PencilLine, Plus, Search, Trash2 } from "lucide-react";
import EmptyState from "@/app/components/EmptyState";
import LoadingSpinner from "@/app/components/LoadingSpinner";
import StatusBadge from "@/app/components/StatusBadge";
import { formatDateTimeLabel, formatUpdatedAtLabel } from "@/lib/utils";
import type { Guest, GuestStatus } from "@/lib/types";

type GuestsTabProps = {
  canEdit: boolean;
  guests: Guest[];
  loading: boolean;
  onAddGuest: () => void;
  onDeleteGuest: (guest: Guest) => Promise<void>;
  onEditGuest: (guest: Guest) => void;
  onRequestUnlock: () => void;
};

type SortField = "name" | "date" | "company";
type FilterField = "all" | GuestStatus;

export default function GuestsTab({
  canEdit,
  guests,
  loading,
  onAddGuest,
  onDeleteGuest,
  onEditGuest,
  onRequestUnlock,
}: GuestsTabProps) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterField>("all");
  const [sort, setSort] = useState<SortField>("date");

  const filteredGuests = useMemo(() => {
    const loweredQuery = query.trim().toLowerCase();

    return [...guests]
      .filter((guest) => {
        if (filter !== "all" && guest.status !== filter) {
          return false;
        }

        if (!loweredQuery) {
          return true;
        }

        return (
          guest.name.toLowerCase().includes(loweredQuery) ||
          guest.company.toLowerCase().includes(loweredQuery)
        );
      })
      .sort((left, right) => {
        if (sort === "name") {
          return left.name.localeCompare(right.name);
        }

        if (sort === "company") {
          return left.company.localeCompare(right.company);
        }

        const leftValue = `${left.date}-${left.time}`;
        const rightValue = `${right.date}-${right.time}`;
        return leftValue.localeCompare(rightValue);
      });
  }, [filter, guests, query, sort]);

  const confirmed = guests.filter((guest) => guest.status === "confirmed").length;
  const tentative = guests.length - confirmed;

  return (
    <section className="space-y-6 p-5 xl:p-6">
      <div className="flex flex-col gap-4 rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-white/45">Guest management</p>
            <h3 className="mt-1 text-2xl font-semibold text-white">
              {guests.length} Guests - {confirmed} Confirmed, {tentative} Tentative
            </h3>
          </div>
          <button
            className="inline-flex items-center justify-center gap-2 rounded-full bg-reuters-red px-4 py-3 text-sm font-medium text-white transition hover:bg-reuters-red-dark"
            onClick={canEdit ? onAddGuest : onRequestUnlock}
            type="button"
          >
            {canEdit ? <Plus className="h-4 w-4" /> : <LockKeyhole className="h-4 w-4" />}
            {canEdit ? "+ Add Guest" : "Unlock Editing"}
          </button>
        </div>

        {!canEdit ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/65">
            Viewing is public. Unlock editing to add, edit, or delete guest slots.
          </div>
        ) : null}

        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_180px_180px]">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-reuters-stone" />
            <input
              className="field-input pl-11"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by guest or company"
              type="search"
              value={query}
            />
          </label>

          <label className="relative block">
            <select
              className="field-input appearance-none"
              onChange={(event) => setFilter(event.target.value as FilterField)}
              value={filter}
            >
              <option value="all">All statuses</option>
              <option value="tentative">Tentative</option>
              <option value="confirmed">Confirmed</option>
            </select>
          </label>

          <label className="relative block">
            <ArrowUpDown className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-reuters-stone" />
            <select
              className="field-input appearance-none pl-11"
              onChange={(event) => setSort(event.target.value as SortField)}
              value={sort}
            >
              <option value="date">Sort by date</option>
              <option value="name">Sort by name</option>
              <option value="company">Sort by company</option>
            </select>
          </label>
        </div>
      </div>

      {loading ? (
        <div className="card-surface flex min-h-72 items-center justify-center">
          <LoadingSpinner label="Loading guests" />
        </div>
      ) : filteredGuests.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/[0.04] lg:block">
            <table className="min-w-full divide-y divide-white/10">
              <thead className="bg-white/[0.03] text-left text-xs uppercase tracking-[0.2em] text-white/45">
                <tr>
                  <th className="px-6 py-4">Guest</th>
                  <th className="px-6 py-4">Company</th>
                  <th className="px-6 py-4">Slot</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Notes</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10 text-sm">
                {filteredGuests.map((guest) => (
                  <tr key={guest.id} className="align-top text-white/80">
                    <td className="px-6 py-5">
                      <div className="font-medium text-white">{guest.name}</div>
                      <div className="mt-1 text-xs text-white/45">
                        Last updated {formatUpdatedAtLabel(guest.updatedAt)}
                      </div>
                    </td>
                    <td className="px-6 py-5">{guest.company}</td>
                    <td className="px-6 py-5">{formatDateTimeLabel(guest.date, guest.time, guest.endTime)}</td>
                    <td className="px-6 py-5">
                      <StatusBadge status={guest.status} />
                    </td>
                    <td className="max-w-xs px-6 py-5 text-white/60">{guest.notes || "-"}</td>
                    <td className="px-6 py-5">
                      <div className="flex justify-end gap-2">
                        <button
                          aria-label={`Edit ${guest.name}`}
                          className="rounded-full border border-white/10 p-2 text-white/70 transition hover:border-reuters-red/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                          disabled={!canEdit}
                          onClick={() => (canEdit ? onEditGuest(guest) : onRequestUnlock())}
                          type="button"
                        >
                          <PencilLine className="h-4 w-4" />
                        </button>
                        <button
                          aria-label={`Delete ${guest.name}`}
                          className="rounded-full border border-white/10 p-2 text-white/70 transition hover:border-red-300/20 hover:text-red-100 disabled:cursor-not-allowed disabled:opacity-40"
                          disabled={!canEdit}
                          onClick={() => (canEdit ? void onDeleteGuest(guest) : onRequestUnlock())}
                          type="button"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid gap-4 lg:hidden">
            {filteredGuests.map((guest) => (
              <article key={guest.id} className="card-surface p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-lg font-semibold text-white">{guest.name}</h4>
                    <p className="mt-1 text-sm text-white/60">{guest.company}</p>
                  </div>
                  <StatusBadge status={guest.status} />
                </div>
                <p className="mt-4 text-sm text-white/70">
                  {formatDateTimeLabel(guest.date, guest.time, guest.endTime)}
                </p>
                {guest.notes ? (
                  <p className="mt-4 rounded-2xl bg-black/15 px-3 py-3 text-sm leading-6 text-white/70">
                    {guest.notes}
                  </p>
                ) : null}
                <div className="mt-4 flex items-center justify-between gap-3">
                  <span className="text-xs text-white/45">
                    Last updated {formatUpdatedAtLabel(guest.updatedAt)}
                  </span>
                  <div className="flex gap-2">
                    <button
                      aria-label={`Edit ${guest.name}`}
                      className="rounded-full border border-white/10 p-2 text-white/70 transition hover:border-reuters-red/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                      disabled={!canEdit}
                      onClick={() => (canEdit ? onEditGuest(guest) : onRequestUnlock())}
                      type="button"
                    >
                      <PencilLine className="h-4 w-4" />
                    </button>
                    <button
                      aria-label={`Delete ${guest.name}`}
                      className="rounded-full border border-white/10 p-2 text-white/70 transition hover:border-red-300/20 hover:text-red-100 disabled:cursor-not-allowed disabled:opacity-40"
                      disabled={!canEdit}
                      onClick={() => (canEdit ? void onDeleteGuest(guest) : onRequestUnlock())}
                      type="button"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
