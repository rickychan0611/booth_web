import { clsx } from "clsx";
import type { TicketStatus } from "@/types/database";

const STATUS_CLASSES: Record<TicketStatus, string> = {
  waiting: "bg-amber-100 text-amber-900",
  active: "bg-emerald-100 text-emerald-900",
  skipped: "bg-neutral-200 text-neutral-700",
  cancelled: "bg-rose-100 text-rose-800",
  used: "bg-sky-100 text-sky-800",
};

export function StatusBadge({ status }: { status: TicketStatus }) {
  return (
    <span
      className={clsx(
        "rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wide",
        STATUS_CLASSES[status],
      )}
    >
      {status}
    </span>
  );
}
