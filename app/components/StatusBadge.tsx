import type { GuestStatus } from "@/lib/types";

type StatusBadgeProps = {
  status: GuestStatus;
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const styles =
    status === "confirmed"
      ? "border-emerald-300/35 bg-emerald-400/15 text-emerald-100"
      : "border-amber-300/35 bg-amber-300/15 text-amber-100";

  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${styles}`}>
      {status === "confirmed" ? "Confirmed" : "Tentative"}
    </span>
  );
}
