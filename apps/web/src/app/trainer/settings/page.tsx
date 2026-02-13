import { cookies } from "next/headers";
import { API_URL } from "@/lib/config";
import { CalendarExport } from "@/components/trainer/calendar-export";
import { Card, CardContent } from "@/components/ui/card";
import {
  Settings,
  RefreshCw,
  Calendar,
  Link as LinkIcon,
  AlertTriangle,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

async function getCalendarData() {
  const cookieStore = cookies();
  const token = cookieStore.get("Authentication")?.value;
  if (!token) return { calendarUrl: null };

  let meRes;
  try {
    meRes = await fetch(`${API_URL}/auth/me`, {
      headers: { Cookie: `Authentication=${token}` },
      cache: "no-store",
    });
  } catch (e) {
    console.warn("Failed for /auth/me", e);
    return { calendarUrl: null };
  }

  if (!meRes || !meRes.ok) return { calendarUrl: null };

  const user = await meRes.json();
  const trainerId = user.formateur?.id;

  if (!trainerId) return { calendarUrl: null };

  const calendarRes = await fetch(
    `${API_URL}/trainers/${trainerId}/calendar-url`,
    {
      headers: { Cookie: `Authentication=${token}` },
      cache: "no-store",
    },
  );

  let calendarUrl = null;
  if (calendarRes.ok) {
    const data = await calendarRes.json();
    calendarUrl = data.url;
  }

  return { calendarUrl };
}

export default async function TrainerSettingsPage() {
  const { calendarUrl } = await getCalendarData();

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row items-center gap-6 mb-8">
        <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-lg shadow-primary/5">
          <Settings className="h-10 w-10" />
        </div>
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-gray-900 mb-2">
            Paramètres & Sync
          </h1>
          <p className="text-muted-foreground font-medium text-lg">
            Gérez vos préférences et la synchronisation de vos outils.
          </p>
        </div>
      </div>

      <div className="grid gap-8">
        {/* Calendar Sync Section */}
        <Card className="rounded-[2rem] border-border shadow-sm overflow-hidden bg-white">
          <CardContent className="p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                <Calendar className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-black tracking-tight text-gray-900">
                  Synchronisation Calendrier
                </h2>
                <p className="text-muted-foreground text-sm font-medium">
                  Connectez votre agenda personnel.
                </p>
              </div>
            </div>

            <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-6 mb-8">
              <div className="flex gap-4">
                <AlertTriangle className="h-6 w-6 text-blue-600 shrink-0" />
                <div className="space-y-2">
                  <h4 className="font-bold text-blue-900">
                    Comment ça marche ?
                  </h4>
                  <p className="text-sm text-blue-800/80 leading-relaxed">
                    En activant la synchronisation, vos missions Form-Act
                    apparaîtront automatiquement dans votre Google Calendar,
                    Outlook ou Apple Calendar via un abonnement iCal.
                  </p>
                </div>
              </div>
            </div>

            <CalendarExport url={calendarUrl} />
          </CardContent>
        </Card>

        {/* Future Settings Placeholders */}
        <Card className="rounded-[2rem] border-dashed border-2 border-border/60 bg-muted/5 shadow-none opacity-60">
          <CardContent className="p-8 text-center py-12">
            <div className="inline-flex items-center justify-center p-4 bg-muted rounded-full mb-4">
              <RefreshCw className="h-8 w-8 text-muted-foreground animate-spin-slow" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Bientôt disponible...
            </h3>
            <p className="text-muted-foreground max-w-sm mx-auto">
              D&apos;autres paramètres de notifications et de préférences seront
              ajoutés prochainement.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
