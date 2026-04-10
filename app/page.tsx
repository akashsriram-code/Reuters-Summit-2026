"use client";

import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import CalendarView from "@/app/components/CalendarView";
import GuestModal from "@/app/components/GuestModal";
import GuestsTab from "@/app/components/GuestsTab";
import Header from "@/app/components/Header";
import LoadingSpinner from "@/app/components/LoadingSpinner";
import UnlockModal from "@/app/components/UnlockModal";
import { getEditorSessionState, lockEditing, unlockEditing } from "@/lib/editorSession";
import { addGuest, deleteGuest, subscribeToGuests, updateGuest } from "@/lib/guestService";
import { isFirebaseConfigured } from "@/lib/firebase";
import { SUMMIT_DAY_END_TIME } from "@/lib/types";
import { addMinutesToTime, timeToMinutes } from "@/lib/utils";
import type { DashboardTab, Guest, GuestFormValues } from "@/lib/types";

type ModalState =
  | { mode: "create"; guest?: undefined; defaultDate?: string; defaultTime?: string }
  | { mode: "edit"; guest: Guest; defaultDate?: undefined; defaultTime?: undefined };

export default function Home() {
  const [activeTab, setActiveTab] = useState<DashboardTab>("calendar");
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalState, setModalState] = useState<ModalState | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditor, setIsEditor] = useState(false);
  const [isEditorLoading, setIsEditorLoading] = useState(true);
  const [isUnlockModalOpen, setIsUnlockModalOpen] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);

  useEffect(() => {
    let active = true;

    getEditorSessionState()
      .then((session) => {
        if (!active) {
          return;
        }

        setIsEditor(session.isEditor);
      })
      .catch(() => {
        if (!active) {
          return;
        }

        setIsEditor(false);
      })
      .finally(() => {
        if (active) {
          setIsEditorLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setError(
        "Firebase is not configured yet. Add your NEXT_PUBLIC_FIREBASE_* values to .env.local to enable live collaboration.",
      );
      setLoading(false);
      return;
    }

    const unsubscribe = subscribeToGuests(
      (nextGuests) => {
        setGuests(nextGuests);
        setLoading(false);
        setError(null);
      },
      (subscriptionError) => {
        setError(subscriptionError.message || "Unable to load guest data right now.");
        setLoading(false);
      },
    );

    return unsubscribe;
  }, []);

  const counts = useMemo(() => {
    const confirmed = guests.filter((guest) => guest.status === "confirmed").length;
    const tentative = guests.length - confirmed;

    return { total: guests.length, confirmed, tentative };
  }, [guests]);

  const closeModal = () => {
    if (isSaving) {
      return;
    }

    setModalState(null);
  };

  const openUnlockModal = () => {
    setIsUnlockModalOpen(true);
  };

  const closeUnlockModal = () => {
    if (isUnlocking) {
      return;
    }

    setIsUnlockModalOpen(false);
  };

  const handleCreateForDate = (date: string, time?: string) => {
    if (!isEditor) {
      openUnlockModal();
      return;
    }

    setModalState({ mode: "create", defaultDate: date, defaultTime: time });
  };

  const handleCreate = () => {
    if (!isEditor) {
      openUnlockModal();
      return;
    }

    setModalState({ mode: "create" });
  };

  const handleEdit = (guest: Guest) => {
    if (!isEditor) {
      openUnlockModal();
      return;
    }

    setModalState({ mode: "edit", guest });
  };

  const handleDelete = async (guest: Guest) => {
    if (!isEditor) {
      openUnlockModal();
      return;
    }

    const confirmed = window.confirm(`Delete ${guest.name}'s guest slot?`);

    if (!confirmed) {
      return;
    }

    try {
      setError(null);
      await deleteGuest(guest.id);
    } catch (deleteError) {
      const message =
        deleteError instanceof Error ? deleteError.message : "Unable to delete this guest.";
      setError(message);
    }
  };

  const handleMoveGuest = async (guest: Guest, date: string, time: string) => {
    if (!isEditor) {
      openUnlockModal();
      return;
    }

    try {
      setError(null);
      const duration = Math.max(30, timeToMinutes(guest.endTime) - timeToMinutes(guest.time));

      await updateGuest(guest.id, {
        company: guest.company,
        date,
        endTime: addMinutesToTime(time, duration, SUMMIT_DAY_END_TIME),
        name: guest.name,
        notes: guest.notes,
        status: guest.status,
        time,
      });
    } catch (moveError) {
      const message =
        moveError instanceof Error ? moveError.message : "Unable to move this guest slot.";
      setError(message);
    }
  };

  const handleSubmit = async (values: GuestFormValues) => {
    if (!isEditor) {
      openUnlockModal();
      return;
    }

    try {
      setIsSaving(true);
      setError(null);

      if (modalState?.mode === "edit") {
        await updateGuest(modalState.guest.id, values);
      } else {
        await addGuest(values);
      }

      setModalState(null);
    } catch (saveError) {
      const message =
        saveError instanceof Error ? saveError.message : "Unable to save this guest.";
      setError(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUnlock = async (password: string) => {
    try {
      setIsUnlocking(true);
      setError(null);
      await unlockEditing(password);
      setIsEditor(true);
      setIsUnlockModalOpen(false);
    } finally {
      setIsUnlocking(false);
    }
  };

  const handleLockEditing = async () => {
    try {
      setIsEditorLoading(true);
      setError(null);
      await lockEditing();
      setIsEditor(false);
      setModalState(null);
    } catch (lockError) {
      const message =
        lockError instanceof Error ? lockError.message : "Unable to lock editing right now.";
      setError(message);
    } finally {
      setIsEditorLoading(false);
    }
  };

  const lastUpdatedLabel = useMemo(() => {
    if (guests.length === 0) {
      return "Awaiting first guest entry";
    }

    const latestUpdate = guests.reduce<Date | null>((latest, guest) => {
      if (!guest.updatedAt) {
        return latest;
      }

      if (!latest || guest.updatedAt > latest) {
        return guest.updatedAt;
      }

      return latest;
    }, null);

    return latestUpdate ? format(latestUpdate, "MMM d, yyyy 'at' h:mm a") : "Live";
  }, [guests]);

  return (
    <main className="min-h-screen bg-reuters-navy text-white">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,_rgba(255,107,53,0.28),_transparent_25%),radial-gradient(circle_at_bottom_left,_rgba(72,200,167,0.16),_transparent_25%),linear-gradient(180deg,_#10203A_0%,_#0A1628_55%,_#08111F_100%)]" />
      <div className="mx-auto flex min-h-screen w-full max-w-[1600px] flex-col px-4 py-5 sm:px-5 lg:px-6 xl:px-8">
        <Header
          activeTab={activeTab}
          counts={counts}
          isEditor={isEditor}
          isEditorLoading={isEditorLoading}
          onLockEditing={handleLockEditing}
          onRequestUnlock={openUnlockModal}
          onTabChange={setActiveTab}
        />

        <section className="mt-6 flex-1">
          <div className="flex flex-col gap-4 rounded-[2rem] border border-white/10 bg-white/[0.03] px-5 py-4 shadow-lg shadow-black/10 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-white/55">Live planning desk</p>
              <h2 className="mt-1 text-2xl font-semibold text-white sm:text-3xl">
                Reuters Summit 2026 Dashboard
              </h2>
            </div>
            <div className="flex items-center gap-3 text-sm text-white/70">
              {loading ? <LoadingSpinner label="Syncing summit data" /> : null}
              <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2">
                Last updated: {lastUpdatedLabel}
              </span>
            </div>
          </div>

          {error ? (
            <div className="mt-4 rounded-2xl border border-red-300/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
              {error}
            </div>
          ) : null}

          <div className="relative mt-6 overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] shadow-2xl shadow-black/20 backdrop-blur">
            <div className={`transition-all duration-300 ${loading ? "opacity-80" : "opacity-100"}`}>
              {activeTab === "calendar" ? (
                <CalendarView
                  canEdit={isEditor}
                  guests={guests}
                  loading={loading}
                  onAddGuest={handleCreate}
                  onAddGuestForDate={handleCreateForDate}
                  onDeleteGuest={handleDelete}
                  onEditGuest={handleEdit}
                  onMoveGuest={handleMoveGuest}
                  onRequestUnlock={openUnlockModal}
                />
              ) : (
                <GuestsTab
                  canEdit={isEditor}
                  guests={guests}
                  loading={loading}
                  onAddGuest={handleCreate}
                  onDeleteGuest={handleDelete}
                  onEditGuest={handleEdit}
                  onRequestUnlock={openUnlockModal}
                />
              )}
            </div>
          </div>
        </section>

        <footer className="py-6 text-center text-sm text-white/55">
          by akash sriram
        </footer>
      </div>

      <GuestModal
        canEdit={isEditor}
        defaultDate={modalState?.mode === "create" ? modalState.defaultDate : undefined}
        defaultTime={modalState?.mode === "create" ? modalState.defaultTime : undefined}
        guest={modalState?.mode === "edit" ? modalState.guest : undefined}
        isOpen={Boolean(modalState)}
        isSaving={isSaving}
        mode={modalState?.mode ?? "create"}
        onClose={closeModal}
        onSubmit={handleSubmit}
      />

      <UnlockModal
        isBusy={isUnlocking}
        isOpen={isUnlockModalOpen}
        onClose={closeUnlockModal}
        onSubmit={handleUnlock}
      />
    </main>
  );
}
