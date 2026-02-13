"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { API_URL } from "@/lib/config";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  billedAt?: string | null;
}

export function AdminSessionControls({
  session,
  trainers,
}: {
  session: Session;
  trainers: Trainer[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedTrainer, setSelectedTrainer] = useState<string>(
    session.trainerId || "unassigned",
  );
  const [isLogisticsOpen, setIsLogisticsOpen] = useState(
    session.isLogisticsOpen,
  );

  const isLocked = session.status === "INVOICED" || !!session.billedAt;

  const handleUpdate = async (updates: any) => {
    setLoading(true);
    try {
      const res = await fetch(
        `${API_URL}/sessions/${session.id}/admin-update`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updates),
          credentials: "include",
        },
      );
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
    if (
      !confirm(
        "Êtes-vous sûr de vouloir ANNULER cette session ? Cette action est irréversible et notifiera le client et le formateur.",
      )
    )
      return;
    handleUpdate({ status: "CANCELLED" });
  };

  return (
    <div className="space-y-6">
      <Card className="rounded-[2rem] border-transparent shadow-sm bg-white overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-black text-gray-900">
            Affectation Formateur
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-2">
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <Select
                value={selectedTrainer}
                onValueChange={handleTrainerChange}
                disabled={loading || isLocked}
              >
                <SelectTrigger className="w-full rounded-xl border-border/50 bg-muted/5 h-12 font-medium">
                  <SelectValue placeholder="Choisir un formateur" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-border/50 shadow-lg">
                  <SelectItem
                    value="unassigned"
                    className="font-bold text-amber-600 focus:text-amber-700 focus:bg-amber-50 rounded-lg my-1"
                  >
                    -- Non Assigné --
                  </SelectItem>
                  {trainers.map((t) => (
                    <SelectItem
                      key={t.id}
                      value={t.id}
                      className="rounded-lg my-0.5 font-medium"
                    >
                      {t.firstName} {t.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <p className="text-xs text-muted-foreground bg-blue-50 text-blue-700 p-3 rounded-xl border border-blue-100">
            <strong>Note :</strong> Ce sélecteur ignore les règles de zone et
            d&apos;expertise (Forçage).
          </p>
        </CardContent>
      </Card>

      <Card className="rounded-[2rem] border-transparent shadow-sm bg-white overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-black text-gray-900">
            Dérogations & Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 pt-4">
          <div className="flex items-center justify-between bg-muted/5 p-4 rounded-xl border border-border/50">
            <div className="space-y-0.5">
              <label className="text-sm font-bold text-gray-900">
                Déverrouiller Logistique
              </label>
              <p className="text-xs text-muted-foreground font-medium">
                Autoriser le client à modifier les infos après J-7
              </p>
            </div>
            <div className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                id="logistics-toggle"
                className="sr-only peer"
                checked={isLogisticsOpen}
                onChange={(e) => handleLogisticsToggle(e.target.checked)}
                disabled={loading || isLocked}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </div>
          </div>

          <div className="pt-2">
            <Button
              variant="destructive"
              onClick={handleCancel}
              disabled={loading || session.status === "CANCELLED" || isLocked}
              className="w-full rounded-xl font-bold h-12 shadow-sm hover:shadow-md transition-all"
            >
              {session.status === "CANCELLED"
                ? "Session Annulée"
                : "Annuler la Session"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
