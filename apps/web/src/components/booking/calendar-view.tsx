import * as React from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { DayPicker } from "react-day-picker";
import { Button } from "@/components/ui/button";
import "react-day-picker/style.css";

interface CalendarViewProps {
  isVisible: boolean;
  selectedDate: Date | undefined;
  onDateSelect: (date: Date | undefined) => void;
  isDateDisabled: (date: Date) => boolean;
  isHalfDay: boolean;
  availableSlots: string[];
  selectedSlot: string;
  onSelectSlot: (slot: string) => void;
}

export function CalendarView({
  isVisible,
  selectedDate,
  onDateSelect,
  isDateDisabled,
  isHalfDay,
  availableSlots,
  selectedSlot,
  onSelectSlot,
}: CalendarViewProps) {
  if (!isVisible) return null;

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">3. Choisissez une date</label>
      <div className="border rounded-md p-2 flex justify-center">
        <DayPicker
          mode="single"
          selected={selectedDate}
          onSelect={onDateSelect}
          disabled={isDateDisabled}
          locale={fr}
          modifiersClassNames={{
            selected:
              "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
            today: "bg-accent text-accent-foreground",
          }}
          classNames={{
            head_cell: "text-muted-foreground font-normal text-[0.8rem]",
            day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100",
          }}
        />
      </div>

      {/* Slots for HALF_DAY */}
      {isHalfDay && selectedDate && (
        <div className="flex gap-2 mt-2">
          {availableSlots.map((slot) => (
            <Button
              key={slot}
              variant={selectedSlot === slot ? "default" : "outline"}
              onClick={() => onSelectSlot(slot)}
              className="flex-1"
            >
              {slot === "AM"
                ? "Matin (09:00 - 12:30)"
                : "Après-midi (13:30 - 17:00)"}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
