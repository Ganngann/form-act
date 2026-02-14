"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { API_URL } from "@/lib/config";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { User, ShieldCheck, AlertCircle } from "lucide-react";
import { Switch } from "@/components/ui/switch";

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
  billedAt?: string | null;
}

export function AdminSessionControls({ session, trainers }: { session: Session; trainers: Trainer[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedTrainer, setSelectedTrainer] = useState<string>(session.trainerId || "unassigned");
  const [isLogisticsOpen, setIsLogisticsOpen] = useState(session.isLogisticsOpen);

  const isLocked = session.status === "INVOICED" || !!session.billedAt;

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
      <Card className="rounded-[2.5rem] border-none shadow-xl bg-white overflow-hidden">
        <CardHeader className="bg-gray-50/50 border-b border-gray-100/50 pb-4">
          <CardTitle className="text-lg font-black text-gray-900 tracking-tight flex items-center gap-2">
            <User className="h-5 w-5 text-primary" /> Affectation Formateur
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-8 pt-6">
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <Select value={selectedTrainer} onValueChange={handleTrainerChange} disabled={loading || isLocked}>
                <SelectTrigger className="w-full rounded-xl border-gray-100 bg-gray-50/50 h-12 font-bold focus:bg-white transition-all">
                  <SelectValue placeholder="Choisir un formateur" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-border shadow-2xl">
                  <SelectItem value="unassigned" className="font-black text-amber-600 focus:text-amber-700 focus:bg-amber-50 rounded-xl my-1">-- Non Assigné --</SelectItem>
                  {trainers.map(t => (
                    <SelectItem key={t.id} value={t.id} className="rounded-xl my-0.5 font-bold">{t.firstName} {t.lastName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="text-[10px] font-bold text-blue-700 bg-blue-50/50 p-4 rounded-2xl border border-blue-100/50 flex items-start gap-3">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>Note : Ce sélecteur ignore les règles de zone et d&apos;expertise (Forçage manuel).</span>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-[2.5rem] border-none shadow-xl bg-white overflow-hidden">
        <CardHeader className="bg-gray-50/50 border-b border-gray-100/50 pb-4">
          <CardTitle className="text-lg font-black text-gray-900 tracking-tight flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-blue-600" /> Dérogations & Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 p-8 pt-6">

          <div className="flex items-center justify-between bg-slate-50/50 p-5 rounded-2xl border border-slate-100">
            <div className="space-y-0.5">
              <label className="text-sm font-black text-gray-900 uppercase tracking-tighter">Déverrouiller Logistique</label>
              <p className="text-[11px] text-muted-foreground font-bold leading-tight">Autoriser le client à modifier les infos après J-7</p>
            </div>
            <Switch
              checked={isLogisticsOpen}
              onCheckedChange={handleLogisticsToggle}
              disabled={loading || isLocked}
            />
          </div>

          <div className="pt-2">
            <Button
              variant="ghost"
              onClick={handleCancel}
              disabled={loading || session.status === 'CANCELLED' || isLocked}
              className="w-full rounded-2xl font-black text-red-500 hover:text-red-600 hover:bg-red-50 h-14 border-2 border-transparent hover:border-red-100 transition-all uppercase tracking-widest text-[10px]"
            >
              {session.status === 'CANCELLED' ? "Session Annulée" : "Annuler la Session définitivement"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
