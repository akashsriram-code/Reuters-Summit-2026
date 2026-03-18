"use client";

import { LockKeyhole, LogOut } from "lucide-react";
import type { DashboardTab } from "@/lib/types";

type HeaderProps = {
  activeTab: DashboardTab;
  counts: {
    total: number;
    confirmed: number;
    tentative: number;
  };
  isEditor: boolean;
  isEditorLoading: boolean;
  onLockEditing: () => Promise<void>;
  onRequestUnlock: () => void;
  onTabChange: (tab: DashboardTab) => void;
};

const tabs: Array<{ id: DashboardTab; label: string }> = [
  { id: "calendar", label: "Calendar" },
  { id: "guests", label: "Guests" },
];

export default function Header({
  activeTab,
  counts,
  isEditor,
  isEditorLoading,
  onLockEditing,
  onRequestUnlock,
  onTabChange,
}: HeaderProps) {
  return (
    <header className="card-surface sticky top-4 z-30 px-4 py-4 sm:px-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <div className="rounded-2xl border border-reuters-red/30 bg-reuters-red/10 px-4 py-3">
            <span className="text-lg font-extrabold tracking-[0.32em] text-reuters-red">REUTERS</span>
          </div>
          <div>
            <h1 className="text-xl font-semibold text-white sm:text-2xl">Summit 2026 Dashboard</h1>
            <p className="mt-1 text-sm text-white/50">
              {isEditor ? "Editing unlocked" : "Read-only mode"}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <nav className="inline-flex rounded-full border border-white/10 bg-white/5 p-1">
            {tabs.map((tab) => {
              const active = tab.id === activeTab;

              return (
                <button
                  key={tab.id}
                  className={`tab-button min-w-28 ${
                    active
                      ? "bg-reuters-red text-white shadow-lg shadow-reuters-red/20"
                      : "text-white/70 hover:bg-white/5 hover:text-white"
                  }`}
                  onClick={() => onTabChange(tab.id)}
                  type="button"
                >
                  {tab.label}
                </button>
              );
            })}
          </nav>

          <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70">
            {counts.total} Guests · {counts.confirmed} Confirmed · {counts.tentative} Tentative
          </div>

          {isEditor ? (
            <button
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/80 transition hover:border-white/20 hover:text-white disabled:opacity-60"
              disabled={isEditorLoading}
              onClick={() => void onLockEditing()}
              type="button"
            >
              <LogOut className="h-4 w-4" />
              Lock Editing
            </button>
          ) : (
            <button
              className="inline-flex items-center justify-center gap-2 rounded-full bg-reuters-red px-4 py-2 text-sm font-medium text-white transition hover:bg-reuters-red-dark disabled:opacity-60"
              disabled={isEditorLoading}
              onClick={onRequestUnlock}
              type="button"
            >
              <LockKeyhole className="h-4 w-4" />
              Unlock Editing
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
