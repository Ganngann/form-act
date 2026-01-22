import { useState, useEffect } from "react"
import { format } from "date-fns"
import { API_URL } from "@/lib/config"

export type Zone = { id: string; name: string }
export type Trainer = { id: string; firstName: string; lastName: string }
export type Session = { date: string; slot: string; status: string }

interface UseBookingLogicProps {
  formation: {
    id: string
    title: string
    durationType: string // 'HALF_DAY' | 'FULL_DAY'
    expertise?: { id: string }
  }
}

export function useBookingLogic({ formation }: UseBookingLogicProps) {
  const [zones, setZones] = useState<Zone[]>([])
  const [selectedZone, setSelectedZone] = useState<string>("")

  const [trainers, setTrainers] = useState<Trainer[]>([])
  const [selectedTrainer, setSelectedTrainer] = useState<string>("")

  const [availability, setAvailability] = useState<Session[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedSlot, setSelectedSlot] = useState<string>("")

  const [loadingZones, setLoadingZones] = useState(false)
  const [loadingTrainers, setLoadingTrainers] = useState(false)
  const [loadingAvailability, setLoadingAvailability] = useState(false)

  useEffect(() => {
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

  useEffect(() => {
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

  useEffect(() => {
    if (!selectedTrainer) return

    // Manual handling: No availability check
    if (selectedTrainer === 'manual') {
        setAvailability([]);
        setSelectedDate(undefined);
        setSelectedSlot("");
        return;
    }

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

    // If manual request, all future dates are available
    if (selectedTrainer === 'manual') return false;

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

  return {
    zones,
    selectedZone,
    setSelectedZone,
    trainers,
    selectedTrainer,
    setSelectedTrainer,
    availability,
    selectedDate,
    setSelectedDate, // Exposed for direct manipulation if needed, but handleDateSelect is preferred
    handleDateSelect,
    selectedSlot,
    setSelectedSlot,
    loadingZones,
    loadingTrainers,
    loadingAvailability,
    isDateDisabled,
    getAvailableSlots,
    // Derived state or helpers
    canBook: !!selectedDate && !!selectedSlot
  }
}
