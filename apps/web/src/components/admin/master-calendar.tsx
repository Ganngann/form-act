"use client"

import * as React from "react"
import { addMonths, eachDayOfInterval, endOfMonth, endOfWeek, format, startOfMonth, startOfWeek, subMonths, isSameMonth, addWeeks, subWeeks } from "date-fns"
import { fr } from "date-fns/locale"
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarGrid } from "./calendar-grid"
import { SessionDetailsDialog } from "./session-details-dialog"
import { SessionData } from "@/lib/session-status"
import { API_URL } from "@/lib/config"

interface MasterCalendarProps { }

export function MasterCalendar({ }: MasterCalendarProps) {
  const [currentDate, setCurrentDate] = React.useState(new Date())
  const [viewMode, setViewMode] = React.useState<"month" | "week">("week")
  const [selectedSession, setSelectedSession] = React.useState<SessionData | null>(null)
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)

  const [sessions, setSessions] = React.useState<SessionData[]>([])
  const [trainers, setTrainers] = React.useState<any[]>([])
  const [isLoading, setIsLoading] = React.useState(true)

  // Fetch Trainers (Once)
  React.useEffect(() => {
    fetch(`${API_URL}/admin/trainers?take=100`, { credentials: "include" })
      .then(res => res.json())
      .then(data => {
        // data might be { data: [], meta: ... } or just [] depending on backend pagination
        if (Array.isArray(data)) setTrainers(data);
        else if (data.data) setTrainers(data.data);
      })
      .catch(err => console.error("Failed to fetch trainers", err))
  }, [])

  // Calculate days to display
  const days = React.useMemo(() => {
    if (viewMode === "month") {
      const start = startOfMonth(currentDate)
      const end = endOfMonth(currentDate)
      return eachDayOfInterval({ start, end })
    } else {
      const start = startOfWeek(currentDate, { weekStartsOn: 1 }) // Monday
      const end = endOfWeek(currentDate, { weekStartsOn: 1 })
      return eachDayOfInterval({ start, end })
    }
  }, [currentDate, viewMode])

  // Fetch Sessions when days change
  React.useEffect(() => {
    if (days.length === 0) return;

    const start = days[0].toISOString();
    const end = days[days.length - 1].toISOString();

    setIsLoading(true);
    fetch(`${API_URL}/sessions?start=${start}&end=${end}`, { credentials: "include" })
      .then(res => res.json())
      .then(data => {
        setSessions(data);
      })
      .catch(err => console.error("Failed to fetch sessions", err))
      .finally(() => setIsLoading(false));
  }, [days])

  // Navigation handlers
  const handlePrevious = () => {
    if (viewMode === "month") {
      setCurrentDate(prev => subMonths(prev, 1))
    } else {
      setCurrentDate(prev => subWeeks(prev, 1))
    }
  }

  const handleNext = () => {
    if (viewMode === "month") {
      setCurrentDate(prev => addMonths(prev, 1))
    } else {
      setCurrentDate(prev => addWeeks(prev, 1))
    }
  }

  const handleToday = () => {
    setCurrentDate(new Date())
  }

  // Session Click Handler
  const handleSessionClick = (session: SessionData) => {
    setSelectedSession(session)
    setIsDialogOpen(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h2 className="text-2xl font-bold tracking-tight">
            {format(currentDate, viewMode === 'month' ? "MMMM yyyy" : "'Semaine du' d MMMM", { locale: fr })}
          </h2>
          <div className="flex items-center border rounded-md bg-white">
            <Button variant="ghost" size="icon" onClick={handlePrevious}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleToday}>
              Aujourd&apos;hui
            </Button>
            <Button variant="ghost" size="icon" onClick={handleNext}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex space-x-2 bg-slate-100 p-1 rounded-md">
          <button
            onClick={() => setViewMode("month")}
            className={`px-3 py-1 text-sm rounded-sm transition-all ${viewMode === 'month' ? 'bg-white shadow text-black' : 'text-slate-500 hover:text-black'}`}
          >
            Mois
          </button>
          <button
            onClick={() => setViewMode("week")}
            className={`px-3 py-1 text-sm rounded-sm transition-all ${viewMode === 'week' ? 'bg-white shadow text-black' : 'text-slate-500 hover:text-black'}`}
          >
            Semaine
          </button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="h-96 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Chargement du planning...</span>
            </div>
          ) : (
            <CalendarGrid
              days={days}
              trainers={trainers}
              sessions={sessions}
              onSessionClick={handleSessionClick}
            />
          )}
        </CardContent>
      </Card>

      <SessionDetailsDialog
        session={selectedSession}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </div>
  )
}
