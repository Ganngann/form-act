"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { auth } from "@/lib/auth";
import { API_URL } from "@/lib/config";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeftIcon, MapPinIcon, UsersIcon } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function MissionDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [mission, setMission] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMission = async () => {
      const user = auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      try {
        const res = await fetch(`${API_URL}/sessions/${id}`);
        if (res.ok) {
          const data = await res.json();
          setMission(data);
        }
      } catch (err) {
        console.error("Failed to fetch mission", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMission();
  }, [id, router]);

  if (loading) return <div>Chargement...</div>;
  if (!mission) return <div>Mission introuvable.</div>;

  let participants: any[] = [];
  try {
      participants = mission.participants ? JSON.parse(mission.participants) : [];
  } catch (e) {}

  let logistics: any = {};
  try {
      logistics = mission.logistics ? JSON.parse(mission.logistics) : {};
  } catch (e) {}

  const address = mission.location || mission.client?.address;

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => router.back()} className="gap-2">
        <ArrowLeftIcon className="w-4 h-4" /> Retour
      </Button>

      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold">{mission.formation.title}</h2>
          <p className="text-gray-500 mt-1">
            {format(new Date(mission.date), "PPP", { locale: fr })} ({mission.slot})
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Logistics & Location */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPinIcon className="w-5 h-5" /> Lieu & Logistique
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-1">Adresse</h4>
              <p>{address || "Non définie"}</p>
              {address && (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm"
                >
                  Ouvrir dans Google Maps
                </a>
              )}
            </div>
            {mission.client && (
              <div>
                <h4 className="font-semibold mb-1">Contact Client</h4>
                <p>{mission.client.companyName}</p>
                {mission.client.user && <p>{mission.client.user.name}</p>}
              </div>
            )}
             <div>
              <h4 className="font-semibold mb-1">Matériel Requis</h4>
               <ul className="list-disc pl-5">
                {Object.entries(logistics).map(([key, value]: [string, any]) => (
                    <li key={key}><strong>{key}:</strong> {String(value)}</li>
                ))}
                {Object.keys(logistics).length === 0 && <li>Aucun détail spécifique.</li>}
               </ul>
            </div>
          </CardContent>
        </Card>

        {/* Participants */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UsersIcon className="w-5 h-5" /> Participants
            </CardTitle>
          </CardHeader>
          <CardContent>
            {participants.length === 0 ? (
              <p className="text-gray-500">Aucun participant enregistré.</p>
            ) : (
              <ul className="space-y-2">
                {participants.map((p: any, idx: number) => (
                  <li key={idx} className="border-b pb-2 last:border-0">
                    <p className="font-medium">{p.name}</p>
                    <p className="text-sm text-gray-500">{p.email}</p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
