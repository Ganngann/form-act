import { format, isSameDay, isWeekend } from "date-fns";
import { fr } from "date-fns/locale";
import { SessionData } from "@/lib/session-status";
import { SessionPill } from "./session-pill";
import { useMemo } from "react";

interface CalendarGridProps {
  days: Date[];
  trainers: any[]; // User/Trainer type
  sessions: SessionData[];
  onSessionClick: (session: SessionData) => void;
}

export function CalendarGrid({ days, trainers, sessions, onSessionClick }: CalendarGridProps) {

  // Optimize: Create a lookup map for sessions
  // Key: "trainerId-YYYY-MM-DD"
  // Value: SessionData[]
  const sessionsMap = useMemo(() => {
    const map: Record<string, SessionData[]> = {};
    for (const session of sessions) {
      const dateKey = format(new Date(session.date), "yyyy-MM-dd");
      const key = `${session.trainerId}-${dateKey}`;
      if (!map[key]) {
        map[key] = [];
      }
      map[key].push(session);
    }
    return map;
  }, [sessions]);

  return (
    <div className="overflow-x-auto border rounded-lg">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr>
            <th className="sticky left-0 bg-white z-10 p-2 border-b border-r w-48 min-w-[12rem] text-left">
              Formateur
            </th>
            {days.map((day) => (
              <th
                key={day.toISOString()}
                className={`p-2 border-b border-r min-w-[6rem] text-center font-normal ${
                  isWeekend(day) ? "bg-slate-50 text-slate-500" : ""
                }`}
              >
                <div className="font-semibold">{format(day, "EEE", { locale: fr })}</div>
                <div className="text-xs text-muted-foreground">{format(day, "d MMM", { locale: fr })}</div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {trainers.map((trainer) => (
            <tr key={trainer.id} className="hover:bg-slate-50/50">
              <td className="sticky left-0 bg-white z-10 p-2 border-r border-b font-medium truncate max-w-[12rem]">
                {trainer.firstName} {trainer.lastName}
              </td>
              {days.map((day) => {
                const dateKey = format(day, "yyyy-MM-dd");
                const lookupKey = `${trainer.id}-${dateKey}`;
                const daySessions = sessionsMap[lookupKey] || [];

                return (
                  <td
                    key={`${trainer.id}-${day.toISOString()}`}
                    className={`p-1 border-r border-b align-top h-16 ${
                      isWeekend(day) ? "bg-slate-50/30" : ""
                    }`}
                  >
                    {daySessions.map((session) => (
                      <SessionPill
                        key={session.id}
                        session={session}
                        onClick={onSessionClick}
                      />
                    ))}
                  </td>
                );
              })}
            </tr>
          ))}
          {trainers.length === 0 && (
             <tr>
                 <td colSpan={days.length + 1} className="p-8 text-center text-muted-foreground">
                     Aucun formateur trouvé.
                 </td>
             </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
