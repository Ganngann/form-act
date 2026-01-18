"use client"

import * as React from "react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Check, Loader2, MapPin } from "lucide-react"
import { DayPicker } from "react-day-picker"
import "react-day-picker/style.css"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type Zone = { id: string; name: string }
type Trainer = { id: string; firstName: string; lastName: string }
type Session = { date: string; slot: string; status: string }

interface BookingWidgetProps {
  formation: {
    id: string
    title: string
    durationType: string // 'HALF_DAY' | 'FULL_DAY'
    expertise?: { id: string }
  }
}

export function BookingWidget({ formation }: BookingWidgetProps) {
  const [zones, setZones] = React.useState<Zone[]>([])
  const [selectedZone, setSelectedZone] = React.useState<string>("")

  const [trainers, setTrainers] = React.useState<Trainer[]>([])
  const [selectedTrainer, setSelectedTrainer] = React.useState<string>("")

  const [availability, setAvailability] = React.useState<Session[]>([])
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(undefined)
  const [selectedSlot, setSelectedSlot] = React.useState<string>("")

  const [loadingZones, setLoadingZones] = React.useState(false)
  const [loadingTrainers, setLoadingTrainers] = React.useState(false)
  const [loadingAvailability, setLoadingAvailability] = React.useState(false)

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

  React.useEffect(() => {
    setLoadingZones(true)
    fetch(`${API_URL}/zones`)
      .then((res) => res.json())
      .then((data) => {
        setZones(data)
        setLoadingZones(false)
      })
      .catch((err) => {
        console.error(err)
        setLoadingZones(false)
      })
  }, [])

  React.useEffect(() => {
    if (!selectedZone) return
    setLoadingTrainers(true)
    setTrainers([])
    setSelectedTrainer("")
    setAvailability([])
    setSelectedDate(undefined)

    let url = `${API_URL}/dispatcher/trainers?zoneId=${selectedZone}`
    if (formation.expertise?.id) {
        url += `&expertiseId=${formation.expertise.id}`
    }

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setTrainers(data)
        setLoadingTrainers(false)
      })
      .catch((err) => {
        console.error(err)
        setLoadingTrainers(false)
      })
  }, [selectedZone, formation.expertise?.id])

  React.useEffect(() => {
    if (!selectedTrainer) return
    setLoadingAvailability(true)
    setAvailability([])
    setSelectedDate(undefined)
    setSelectedSlot("")

    fetch(`${API_URL}/trainers/${selectedTrainer}/availability`)
      .then((res) => res.json())
      .then((data) => {
        setAvailability(data)
        setLoadingAvailability(false)
      })
      .catch((err) => {
        console.error(err)
        setLoadingAvailability(false)
      })
  }, [selectedTrainer])

  const isDateDisabled = (date: Date) => {
    // Disable past dates
    const today = new Date();
    today.setHours(0,0,0,0);
    if (date < today) return true;

    const ymd = format(date, 'yyyy-MM-dd')
    const sessionsOnDate = availability.filter(s => s.date.startsWith(ymd))

    if (sessionsOnDate.length === 0) return false;

    if (formation.durationType === 'FULL_DAY') {
        return true;
    } else {
        if (sessionsOnDate.some(s => s.slot === 'ALL_DAY')) return true;
        const hasAM = sessionsOnDate.some(s => s.slot === 'AM')
        const hasPM = sessionsOnDate.some(s => s.slot === 'PM')
        if (hasAM && hasPM) return true;
    }
    return false;
  }

  const handleDateSelect = (date: Date | undefined) => {
      setSelectedDate(date);
      setSelectedSlot("");
      if (formation.durationType === 'FULL_DAY' && date) {
          setSelectedSlot("ALL_DAY");
      }
  }

  const getAvailableSlots = () => {
      if (!selectedDate || formation.durationType === 'FULL_DAY') return [];
      const ymd = format(selectedDate, 'yyyy-MM-dd')
      const sessionsOnDate = availability.filter(s => s.date.startsWith(ymd))

      const slots = [];
      if (!sessionsOnDate.some(s => s.slot === 'AM')) slots.push('AM');
      if (!sessionsOnDate.some(s => s.slot === 'PM')) slots.push('PM');
      return slots;
  }

  return (
    <div className="sticky top-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Réserver cette formation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Step 1: Zone */}
          <div className="space-y-2">
            <label className="text-sm font-medium">1. Choisissez votre province</label>
            <Select onValueChange={setSelectedZone} value={selectedZone}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une zone" />
              </SelectTrigger>
              <SelectContent>
                {zones.map((z) => (
                  <SelectItem key={z.id} value={z.id}>{z.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Step 2: Trainer */}
          {selectedZone && (
             <div className="space-y-2">
               <label className="text-sm font-medium">2. Choisissez un formateur</label>
               {loadingTrainers ? (
                 <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="animate-spin h-4 w-4"/> Recherche...</div>
               ) : trainers.length > 0 ? (
                 <Select onValueChange={setSelectedTrainer} value={selectedTrainer}>
                   <SelectTrigger>
                     <SelectValue placeholder="Sélectionner un formateur" />
                   </SelectTrigger>
                   <SelectContent>
                     {trainers.map((t) => (
                       <SelectItem key={t.id} value={t.id}>{t.firstName} {t.lastName}</SelectItem>
                     ))}
                   </SelectContent>
                 </Select>
               ) : (
                 <div className="bg-muted p-4 rounded text-sm text-center">
                   Aucun formateur disponible dans cette zone pour cette expertise.
                   <Button variant="outline" className="mt-2 w-full" size="sm">Demande manuelle</Button>
                 </div>
               )}
             </div>
          )}

          {/* Step 3: Calendar */}
          {selectedTrainer && (
            <div className="space-y-2">
              <label className="text-sm font-medium">3. Choisissez une date</label>
              <div className="border rounded-md p-2 flex justify-center">
                  <DayPicker
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    disabled={isDateDisabled}
                    locale={fr}
                    modifiersClassNames={{
                        selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                        today: "bg-accent text-accent-foreground",
                    }}
                    classNames={{
                        head_cell: "text-muted-foreground font-normal text-[0.8rem]",
                        day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
                    }}
                  />
              </div>

              {/* Slots for HALF_DAY */}
              {formation.durationType === 'HALF_DAY' && selectedDate && (
                  <div className="flex gap-2 mt-2">
                      {getAvailableSlots().map(slot => (
                          <Button
                            key={slot}
                            variant={selectedSlot === slot ? "default" : "outline"}
                            onClick={() => setSelectedSlot(slot)}
                            className="flex-1"
                          >
                              {slot === 'AM' ? 'Matin (09:00 - 12:30)' : 'Après-midi (13:30 - 17:00)'}
                          </Button>
                      ))}
                  </div>
              )}
            </div>
          )}

          {/* Checkout Button */}
          <Button
            className="w-full"
            disabled={!selectedDate || !selectedSlot}
            onClick={() => alert(`Réservation: ${format(selectedDate!, 'yyyy-MM-dd')} ${selectedSlot}`)}
          >
            Réserver
          </Button>

        </CardContent>
      </Card>
    </div>
  )
}
