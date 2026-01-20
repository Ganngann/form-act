"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { API_URL } from "@/lib/config";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarIcon, MapPinIcon } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function TrainerDashboard() {
  const [missions, setMissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMissions = async () => {
      const user = auth.getUser();
      if (!user || !user.formateur) return;

      try {
        const res = await fetch(
          `${API_URL}/trainers/${user.formateur.id}/missions`
        );
        if (res.ok) {
          const data = await res.json();
          setMissions(data);
        }
      } catch (err) {
        console.error("Failed to fetch missions", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMissions();
  }, []);

  if (loading) return <div>Chargement...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Mes Missions à venir</h2>

      {missions.length === 0 ? (
        <p className="text-gray-500">Aucune mission à venir.</p>
      ) : (
        <div className="grid gap-4">
          {missions.map((mission) => (
            <Card key={mission.id}>
              <CardContent className="p-6 flex justify-between items-center">
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">
                    {mission.formation.title}
                  </h3>
                  <div className="flex items-center text-sm text-gray-500 gap-4">
                    <span className="flex items-center gap-1">
                      <CalendarIcon className="w-4 h-4" />
                      {format(new Date(mission.date), "PPP", { locale: fr })} ({mission.slot})
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPinIcon className="w-4 h-4" />
                      {mission.location || mission.client?.address || "Adresse non définie"}
                    </span>
                  </div>
                </div>
                <Button asChild>
                  <Link href={`/trainer/missions/${mission.id}`}>
                    Détails
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
