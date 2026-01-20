import { SessionData, getComputedStatus, STATUS_COLORS } from "@/lib/session-status";
import { cn } from "@/lib/utils";

interface SessionPillProps {
  session: SessionData;
  onClick: (session: SessionData) => void;
}

export function SessionPill({ session, onClick }: SessionPillProps) {
  const status = getComputedStatus(session);
  const colorClass = STATUS_COLORS[status];
  const clientName = session.client?.companyName || "Client";
  const slotLabel = session.slot === 'AM' ? 'Matin' : 'PM';

  return (
    <button
      onClick={() => onClick(session)}
      className={cn(
        "w-full text-xs text-left px-1 py-0.5 rounded border mb-1 truncate transition-colors",
        colorClass
      )}
      title={`${clientName} (${slotLabel})`}
    >
      <span className="font-bold mr-1">{slotLabel}</span>
      {clientName}
    </button>
  );
}
