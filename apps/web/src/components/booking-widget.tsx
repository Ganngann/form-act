"use client";

import * as React from "react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useBookingLogic } from "@/hooks/use-booking-logic";
import { ZoneSelector } from "@/components/booking/zone-selector";
import { TrainerSelector } from "@/components/booking/trainer-selector";
import { CalendarView } from "@/components/booking/calendar-view";

interface BookingWidgetProps {
  formation: {
    id: string;
    title: string;
    durationType: string; // 'HALF_DAY' | 'FULL_DAY'
    isExpertise: boolean;
  };
}

export function BookingWidget({ formation }: BookingWidgetProps) {
  const router = useRouter();
  const {
    zones,
    selectedZone,
    setSelectedZone,
    trainers,
    selectedTrainer,
    setSelectedTrainer,
    loadingTrainers,
    selectedDate,
    handleDateSelect,
    isDateDisabled,
    selectedSlot,
    setSelectedSlot,
    getAvailableSlots,
    canBook,
  } = useBookingLogic({ formation });

  return (
    <div className="sticky top-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Réserver cette formation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ZoneSelector
            zones={zones}
            selectedZone={selectedZone}
            onSelectZone={setSelectedZone}
          />

          <TrainerSelector
            trainers={trainers}
            selectedTrainer={selectedTrainer}
            onSelectTrainer={setSelectedTrainer}
            loading={loadingTrainers}
            isVisible={!!selectedZone}
          />

          <CalendarView
            isVisible={!!selectedTrainer}
            selectedDate={selectedDate}
            onDateSelect={handleDateSelect}
            isDateDisabled={isDateDisabled}
            isHalfDay={formation.durationType === "HALF_DAY"}
            availableSlots={getAvailableSlots()}
            selectedSlot={selectedSlot}
            onSelectSlot={setSelectedSlot}
          />

          {/* Checkout Button */}
          <Button
            className="w-full"
            disabled={!canBook}
            onClick={() => {
              if (!selectedDate) return;
              const params = new URLSearchParams({
                formationId: formation.id,
                date: format(selectedDate, "yyyy-MM-dd"),
                slot: selectedSlot,
              });
              if (selectedTrainer && selectedTrainer !== "manual") {
                params.append("trainerId", selectedTrainer);
              }
              router.push(`/checkout?${params.toString()}`);
            }}
          >
            {selectedTrainer === "manual" ? "Envoyer la demande" : "Réserver"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
