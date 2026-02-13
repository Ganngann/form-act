import { format, isSameDay, isWeekend } from "date-fns";
import { fr } from "date-fns/locale";
import { SessionData } from "@/lib/session-status";
import { SessionPill } from "./session-pill";
import { useMemo, useRef, useEffect } from "react";

interface CalendarGridProps {
  days: Date[];
  trainers: any[]; // User/Trainer type
  sessions: SessionData[];
  onSessionClick: (session: SessionData) => void;
}

export function CalendarGrid({
  days,
  trainers,
  sessions,
  onSessionClick,
}: CalendarGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to today if it exists in the current days list
  useEffect(() => {
    const today = new Date();
    const hasToday = days.some((day) => isSameDay(day, today));

    if (hasToday && containerRef.current) {
      // Find the th that corresponds to today
      const todayElement = containerRef.current.querySelector(
        '[data-today="true"]',
      );
      if (todayElement) {
        todayElement.scrollIntoView({
          behavior: "smooth",
          inline: "center",
          block: "nearest",
        });
      }
    }
  }, [days]);

  // Optimize: Create a lookup map for sessions
  // Key: "trainerId-YYYY-MM-DD"
  // Value: SessionData[]
  const sessionsMap = useMemo(() => {
    const map: Record<string, SessionData[]> = {};
    if (!Array.isArray(sessions)) {
      console.warn("CalendarGrid: sessions prop is not an array", sessions);
      return map;
    }
    for (const session of sessions) {
      if (!session || !session.date) continue;
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
    <div ref={containerRef} className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr>
            <th className="sticky left-0 bg-white z-10 p-2 border-b border-r w-48 min-w-[12rem] text-left">
              Formateur
            </th>
            {days.map((day) => {
              const isToday = isSameDay(day, new Date());
              const isMonday = day.getDay() === 1;
              return (
                <th
                  key={day.toISOString()}
                  data-today={isToday}
                  className={`p-2 border-b border-r min-w-[6.5rem] text-center font-normal transition-colors ${
                    isWeekend(day) ? "bg-slate-50/80 text-slate-400" : ""
                  } ${isToday ? "bg-blue-50 border-x-blue-200" : ""} ${isMonday && !isToday ? "border-l-2 border-l-slate-300" : ""}`}
                >
                  <div
                    className={`font-semibold uppercase text-[10px] tracking-wider mb-1 ${isToday ? "text-blue-600" : "text-slate-500"}`}
                  >
                    {format(day, "EEE", { locale: fr })}
                  </div>
                  <div
                    className={`text-sm font-bold ${isToday ? "text-blue-700" : "text-slate-700"}`}
                  >
                    {format(day, "d MMM", { locale: fr })}
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {(Array.isArray(trainers) ? trainers : []).map((trainer) => (
            <tr key={trainer.id} className="hover:bg-slate-50/50 group">
              <td className="sticky left-0 bg-white z-10 p-3 border-r border-b font-semibold text-slate-700 truncate max-w-[12rem] shadow-[2px_0_5px_rgba(0,0,0,0.05)]">
                {trainer.firstName} {trainer.lastName}
              </td>
              {days.map((day) => {
                const dateKey = format(day, "yyyy-MM-dd");
                const lookupKey = `${trainer.id}-${dateKey}`;
                const daySessions = sessionsMap[lookupKey] || [];
                const isToday = isSameDay(day, new Date());
                const isMonday = day.getDay() === 1;

                return (
                  <td
                    key={`${trainer.id}-${day.toISOString()}`}
                    className={`p-1.5 border-r border-b align-top h-20 transition-colors ${
                      isWeekend(day) ? "bg-slate-50/30" : ""
                    } ${isToday ? "bg-blue-50/20" : ""} ${isMonday ? "border-l-slate-200" : ""}`}
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
          {(!Array.isArray(trainers) || trainers.length === 0) && (
            <tr>
              <td
                colSpan={days.length + 1}
                className="p-8 text-center text-muted-foreground"
              >
                Aucun formateur trouvé.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
