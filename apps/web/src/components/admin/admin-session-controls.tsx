"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { API_URL } from "@/lib/config";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface Trainer {
  id: string;
  firstName: string;
  lastName: string;
}

interface Session {
  id: string;
  trainerId: string | null;
  status: string;
  isLogisticsOpen: boolean;
  trainer: Trainer | null;
}

export function AdminSessionControls({ session, trainers }: { session: Session; trainers: Trainer[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedTrainer, setSelectedTrainer] = useState<string>(session.trainerId || "unassigned");
  const [isLogisticsOpen, setIsLogisticsOpen] = useState(session.isLogisticsOpen);

  const handleUpdate = async (updates: any) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/sessions/${session.id}/admin-update`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
        credentials: "include"
      });
      if (!res.ok) throw new Error("Update failed");
      router.refresh();
    } catch (e) {
      alert("Erreur lors de la mise à jour");
    } finally {
      setLoading(false);
    }
  };

  const handleTrainerChange = (val: string) => {
      setSelectedTrainer(val);
      handleUpdate({ trainerId: val === "unassigned" ? "" : val });
  };

  const handleLogisticsToggle = (checked: boolean) => {
      setIsLogisticsOpen(checked);
      handleUpdate({ isLogisticsOpen: checked });
  };

  const handleCancel = () => {
      if (!confirm("Êtes-vous sûr de vouloir ANNULER cette session ? Cette action est irréversible et notifiera le client et le formateur.")) return;
      handleUpdate({ status: "CANCELLED" });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle>Affectation Formateur</CardTitle></CardHeader>
        <CardContent className="space-y-4">
             <div className="flex gap-4 items-center">
                 <div className="flex-1">
                     <Select value={selectedTrainer} onValueChange={handleTrainerChange} disabled={loading}>
                        <SelectTrigger>
                            <SelectValue placeholder="Choisir un formateur" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="unassigned">-- Non Assigné --</SelectItem>
                            {trainers.map(t => (
                                <SelectItem key={t.id} value={t.id}>{t.firstName} {t.lastName}</SelectItem>
                            ))}
                        </SelectContent>
                     </Select>
                 </div>
             </div>
             <p className="text-sm text-muted-foreground">
                 Note : Ce sélecteur ignore les règles de zone et d&apos;expertise (Forçage).
             </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Dérogations & Status</CardTitle></CardHeader>
        <CardContent className="space-y-6">
             <div className="flex items-center justify-between">
                 <div className="space-y-0.5">
                     <label className="text-base font-medium">Déverrouiller Logistique</label>
                     <p className="text-sm text-muted-foreground">Autoriser le client à modifier les infos après J-7</p>
                 </div>
                 {/* Fallback for Switch if not available: Checkbox */}
                 <input
                    type="checkbox"
                    className="h-6 w-6"
                    checked={isLogisticsOpen}
                    onChange={(e) => handleLogisticsToggle(e.target.checked)}
                    disabled={loading}
                 />
             </div>

             <div className="pt-4 border-t">
                 <Button variant="destructive" onClick={handleCancel} disabled={loading || session.status === 'CANCELLED'}>
                     {session.status === 'CANCELLED' ? "Session Annulée" : "Annuler la Session"}
                 </Button>
             </div>
        </CardContent>
      </Card>
    </div>
  )
}
