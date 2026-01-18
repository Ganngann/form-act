import * as React from "react"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Trainer } from "@/hooks/use-booking-logic"

interface TrainerSelectorProps {
    trainers: Trainer[];
    selectedTrainer: string;
    onSelectTrainer: (value: string) => void;
    loading: boolean;
    isVisible: boolean;
}

export function TrainerSelector({ trainers, selectedTrainer, onSelectTrainer, loading, isVisible }: TrainerSelectorProps) {
    if (!isVisible) return null;

    return (
        <div className="space-y-2">
           <label className="text-sm font-medium">2. Choisissez un formateur</label>
           {loading ? (
             <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="animate-spin h-4 w-4"/> Recherche...</div>
           ) : trainers.length > 0 ? (
             <Select onValueChange={onSelectTrainer} value={selectedTrainer}>
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
    )
}
