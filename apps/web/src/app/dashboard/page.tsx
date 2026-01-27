"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { API_URL } from "@/lib/config"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SessionCard, Session } from "@/components/dashboard/session-card"
import { DashboardAlerts } from "@/components/dashboard/dashboard-alerts"
import { User, FileText } from "lucide-react"
import { differenceInCalendarDays } from "date-fns"

export default function ClientDashboard() {
    const [sessions, setSessions] = useState<Session[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch(`${API_URL}/sessions/me`, { credentials: "include" })
            .then((res) => {
                if (!res.ok) throw new Error("Failed to fetch sessions")
                return res.json()
            })
            .then((data) => {
                setSessions(data)
                setLoading(false)
            })
            .catch((err) => {
                console.error(err)
                setLoading(false)
            })
    }, [])

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const isParticipantsIncomplete = (s: Session) => {
        if (!s.participants) return true;
        try {
            const parsed = JSON.parse(s.participants);
            return !Array.isArray(parsed) || parsed.length === 0;
        } catch {
            return true;
        }
    };

    const isLogisticsStrictlyIncomplete = (s: Session) => {
        // 1. Location
        if (!s.location || s.location.trim() === '') return true;

        if (!s.logistics) return true;
        try {
            const log = JSON.parse(s.logistics);
            // 2. Wifi
            if (log.wifi !== 'yes' && log.wifi !== 'no') return true;
            // 3. Subsides
            if (log.subsidies !== 'yes' && log.subsidies !== 'no') return true;
            // 4. Material
            // Note: 'NONE' in videoMaterial is handled as valid by length > 0
            const hasVideo = Array.isArray(log.videoMaterial) && log.videoMaterial.length > 0;
            const hasWriting = Array.isArray(log.writingMaterial) && log.writingMaterial.length > 0;
            if (!hasVideo && !hasWriting) return true;

            return false;
        } catch {
            return true;
        }
    };

    const isActionRequired = (s: Session) => {
        if (s.status !== 'CONFIRMED') return false;
        const sessionDate = new Date(s.date);
        sessionDate.setHours(0, 0, 0, 0);

        // Past sessions are not "Action Required" for logistics (unless proof is missing, but that's trainer side)
        // Actually, the prompt implies "Upcoming" context for "Action Required".
        if (sessionDate < now) return false;

        const daysDiff = differenceInCalendarDays(sessionDate, now);

        // 1. Missing Logistics (Always urgent if confirmed)
        if (isLogisticsStrictlyIncomplete(s)) return true;

        // 2. Missing Participants (Urgent if < J-15)
        if (isParticipantsIncomplete(s) && daysDiff < 15) return true;

        return false;
    };

    const actionRequiredSessions = sessions.filter(isActionRequired);

    const upcomingSessions = sessions.filter(s => {
        const sessionDate = new Date(s.date);
        sessionDate.setHours(0, 0, 0, 0);
        return sessionDate >= now && !isActionRequired(s);
    });

    const completedSessions = sessions.filter(s => {
        const sessionDate = new Date(s.date);
        sessionDate.setHours(0, 0, 0, 0);
        return sessionDate < now;
    });

    // Alert Logic
    const participantAlerts = sessions.filter(s => {
        const sessionDate = new Date(s.date);
        sessionDate.setHours(0, 0, 0, 0);
        const daysDiff = differenceInCalendarDays(sessionDate, now);

        return sessionDate >= now && daysDiff < 15 && isParticipantsIncomplete(s);
    });

    const alerts = [];
    if (participantAlerts.length > 0) {
        alerts.push({
            type: 'missing-participants' as const,
            count: participantAlerts.length,
            earliestDate: new Date(Math.min(...participantAlerts.map(s => new Date(s.date).getTime())))
        });
    }

    return (
        <div className="container mx-auto py-10 px-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <h1 className="text-3xl font-bold">Mon Espace Client</h1>

                <Link href="/dashboard/profile" className="w-full md:w-auto">
                    <div className="flex items-center gap-3 bg-white border rounded-lg p-3 hover:bg-slate-50 transition-colors shadow-sm cursor-pointer">
                        <div className="bg-primary/10 p-2 rounded-full text-primary">
                            <User size={20} />
                        </div>
                        <div>
                            <p className="font-semibold text-sm">Mon Profil & Facturation</p>
                            <p className="text-xs text-muted-foreground">TVA, Adresse, Email</p>
                        </div>
                    </div>
                </Link>
            </div>

            <DashboardAlerts alerts={alerts} />

            <div className="grid gap-6">
                {loading ? (
                    <p>Chargement de vos formations...</p>
                ) : (
                    <Tabs defaultValue={actionRequiredSessions.length > 0 ? "actions" : "upcoming"} className="w-full">
                        <TabsList className="grid w-full grid-cols-3 mb-8">
                            <TabsTrigger value="actions" className="relative">
                                ⚠️ Action requise
                                {actionRequiredSessions.length > 0 && (
                                    <span className="ml-2 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                                        {actionRequiredSessions.length}
                                    </span>
                                )}
                            </TabsTrigger>
                            <TabsTrigger value="upcoming">📅 À venir</TabsTrigger>
                            <TabsTrigger value="completed">✅ Terminées</TabsTrigger>
                        </TabsList>

                        <TabsContent value="actions">
                            {actionRequiredSessions.length > 0 ? (
                                <div className="grid gap-4">
                                    {actionRequiredSessions.map((session) => (
                                        <SessionCard key={session.id} session={session} isActionRequired={true} />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 bg-slate-50 rounded-lg border border-dashed">
                                    <p className="text-muted-foreground">Aucune action requise pour le moment.</p>
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="upcoming">
                            {upcomingSessions.length > 0 ? (
                                <div className="grid gap-4">
                                    {upcomingSessions.map((session) => (
                                        <SessionCard key={session.id} session={session} />
                                    ))}
                                </div>
                            ) : (
                                <Card>
                                    <CardContent className="py-10 text-center text-muted-foreground">
                                        <p className="mb-4">Vous n&apos;avez pas de sessions à venir.</p>
                                        <Link href="/catalogue" className="text-primary hover:underline font-medium">
                                            Parcourir le catalogue
                                        </Link>
                                    </CardContent>
                                </Card>
                            )}
                        </TabsContent>

                        <TabsContent value="completed">
                            {completedSessions.length > 0 ? (
                                <div className="grid gap-4 opacity-75">
                                    {completedSessions.map((session) => (
                                        <SessionCard key={session.id} session={session} />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <p className="text-muted-foreground">Aucune session terminée.</p>
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                )}
            </div>
        </div>
    )
}
