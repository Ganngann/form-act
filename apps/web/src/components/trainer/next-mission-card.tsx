import Link from "next/link";
import {
  MapPin,
  Clock,
  User,
  Users,
  Navigation,
  FileText,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface NextMissionCardProps {
  mission: any;
}

export function NextMissionCard({ mission }: NextMissionCardProps) {
  if (!mission) return null;

  let participantCount = 0;
  try {
    const participants = mission.participants
      ? JSON.parse(mission.participants)
      : [];
    participantCount = participants.length;
  } catch (e) {
    console.error("Failed to parse participants", e);
  }

  const address =
    mission.location || mission.client?.address || "Adresse manquante";
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  const date = new Date(mission.date);

  return (
    <div className="relative group">
      <div className="absolute inset-0 bg-primary/20 rounded-[2.5rem] blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
      <Card className="relative overflow-hidden border-0 bg-primary text-white rounded-[2.5rem] shadow-2xl">
        {/* Background Pattern */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none"></div>

        <CardContent className="p-8 md:p-10 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Badge
                  variant="secondary"
                  className="bg-white/20 text-white hover:bg-white/30 border-0 uppercase tracking-widest font-black text-[10px] px-3 py-1"
                >
                  Prochaine Mission
                </Badge>
                <span className="text-blue-100 font-medium text-sm flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {mission.slot === "AM"
                    ? "09:00 - 12:30"
                    : mission.slot === "PM"
                      ? "13:30 - 17:00"
                      : "09:00 - 17:00"}
                </span>
              </div>
              <h2 className="text-3xl md:text-5xl font-black tracking-tighter leading-tight mb-2">
                {mission.formation.title}
              </h2>
              <p className="text-blue-100 text-lg font-medium max-w-lg">
                Chez{" "}
                <span className="text-white font-bold">
                  {mission.client?.companyName || "Client Inconnu"}
                </span>
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 text-center min-w-[100px] border border-white/10">
              <span className="block text-4xl font-black">
                {date.getDate()}
              </span>
              <span className="block text-xs font-bold uppercase tracking-widest opacity-80">
                {date.toLocaleDateString("fr-FR", { month: "short" })}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 mb-8 text-blue-50">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
              <div className="h-10 w-10 rounded-lg bg-white/10 flex items-center justify-center text-white">
                <MapPin className="h-5 w-5" />
              </div>
              <div className="overflow-hidden">
                <p className="text-xs uppercase tracking-wider opacity-70 font-bold">
                  Lieu
                </p>
                <p className="font-medium truncate text-white" title={address}>
                  {address}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
              <div className="h-10 w-10 rounded-lg bg-white/10 flex items-center justify-center text-white">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider opacity-70 font-bold">
                  Groupe
                </p>
                <p className="font-medium text-white">
                  {participantCount} participant
                  {participantCount > 1 ? "s" : ""}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <Button
              asChild
              size="lg"
              className="bg-white text-primary hover:bg-white/90 font-black h-12 px-6 rounded-xl shadow-lg border-0 group/btn"
            >
              <Link href={`/trainer/missions/${mission.id}`}>
                Gérer la session{" "}
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white font-bold h-12 px-6 rounded-xl backdrop-blur-sm"
            >
              <a href={mapsUrl} target="_blank" rel="noopener noreferrer">
                <Navigation className="mr-2 h-4 w-4" /> Y aller
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
