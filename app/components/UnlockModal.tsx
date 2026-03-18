"use client";

import { useState } from "react";
import { LockKeyhole, X } from "lucide-react";

type UnlockModalProps = {
  isBusy: boolean;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (password: string) => Promise<void>;
};

export default function UnlockModal({
  isBusy,
  isOpen,
  onClose,
  onSubmit,
}: UnlockModalProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#05101b]/75 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-white p-6 text-reuters-ink shadow-2xl shadow-black/30 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex rounded-full bg-reuters-red/10 p-3 text-reuters-red">
              <LockKeyhole className="h-5 w-5" />
            </div>
            <h2 className="mt-4 text-2xl font-semibold">Unlock Editing</h2>
            <p className="mt-2 text-sm text-reuters-stone">
              Enter the shared editor password to add, edit, or delete guest slots.
            </p>
          </div>
          <button
            aria-label="Close unlock dialog"
            className="rounded-full border border-reuters-line p-2 text-reuters-stone transition hover:border-reuters-red/25 hover:text-reuters-red"
            onClick={onClose}
            type="button"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form
          className="mt-6 space-y-4"
          onSubmit={async (event) => {
            event.preventDefault();
            setError(null);

            try {
              await onSubmit(password);
              setPassword("");
            } catch (submitError) {
              setError(
                submitError instanceof Error ? submitError.message : "Unable to unlock editing right now.",
              );
            }
          }}
        >
          <label className="space-y-2">
            <span className="text-sm font-medium text-reuters-ink">Shared Password</span>
            <input
              autoFocus
              className="field-input"
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter password"
              type="password"
              value={password}
            />
          </label>

          {error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <div className="flex justify-end gap-3 pt-2">
            <button
              className="rounded-full border border-reuters-line px-5 py-3 text-sm font-medium text-reuters-stone transition hover:border-reuters-red/20 hover:text-reuters-red"
              onClick={onClose}
              type="button"
            >
              Cancel
            </button>
            <button
              className="rounded-full bg-reuters-red px-5 py-3 text-sm font-medium text-white transition hover:bg-reuters-red-dark disabled:cursor-not-allowed disabled:opacity-70"
              disabled={isBusy || password.trim().length === 0}
              type="submit"
            >
              {isBusy ? "Unlocking..." : "Unlock Editing"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
