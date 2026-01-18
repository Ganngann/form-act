import * as React from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Zone } from "@/hooks/use-booking-logic"

interface ZoneSelectorProps {
    zones: Zone[];
    selectedZone: string;
    onSelectZone: (value: string) => void;
}

export function ZoneSelector({ zones, selectedZone, onSelectZone }: ZoneSelectorProps) {
    return (
        <div className="space-y-2">
            <label className="text-sm font-medium">1. Choisissez votre province</label>
            <Select onValueChange={onSelectZone} value={selectedZone}>
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
    )
}
