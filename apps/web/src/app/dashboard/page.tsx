"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { API_URL } from "@/lib/config"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SessionCard, Session } from "@/components/dashboard/session-card"
import { DashboardAlerts } from "@/components/dashboard/dashboard-alerts"
import { Button } from "@/components/ui/button"
import { User, FileText, Calendar } from "lucide-react"
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
        <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col gap-2">
                <h1 className="text-4xl font-bold tracking-tight">Mon Espace Client.</h1>
                <p className="text-muted-foreground font-medium">Gérez vos formations et suivez votre budget en temps réel.</p>
            </div>

            <DashboardAlerts alerts={alerts} />

            {/* Bento Grid Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card p-8 flex flex-col justify-between h-[200px]">
                    <div>
                        <span className="text-[10px] font-black text-primary uppercase tracking-[2px]">Prochaine Session</span>
                        {upcomingSessions.length > 0 ? (
                            <h3 className="text-2xl font-bold mt-4 leading-tight truncate">{upcomingSessions[0].formation.title}</h3>
                        ) : (
                            <h3 className="text-2xl font-bold mt-4 leading-tight">Aucune session</h3>
                        )}
                    </div>
                    <div className="flex items-center gap-2 mt-4">
                        <Calendar className="h-4 w-4 text-primary" />
                        <span className="text-sm font-bold">{upcomingSessions.length > 0 ? new Date(upcomingSessions[0].date).toLocaleDateString('fr-FR') : '--/--/--'}</span>
                    </div>
                </div>

                <div className="card p-8 flex flex-col justify-between h-[200px] border-orange-200 bg-orange-50/30">
                    <div>
                        <span className="text-[10px] font-black text-orange-600 uppercase tracking-[2px]">Actions Requises</span>
                        <div className="flex items-baseline gap-2 mt-4">
                            <span className="text-5xl font-black text-orange-600">{actionRequiredSessions.length}</span>
                            <span className="text-sm font-bold text-orange-600/60 uppercase">Dossiers</span>
                        </div>
                    </div>
                    <p className="text-xs font-bold text-orange-600/80 uppercase tracking-wider">Mise à jour nécessaire</p>
                </div>

                <div className="card p-8 flex flex-col justify-center h-[200px]">
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[2px]">Satisfaction</span>
                    <div className="flex items-baseline gap-1 mt-2">
                        <span className="text-5xl font-black tracking-tighter">98%</span>
                    </div>
                    <p className="text-xs font-medium text-muted-foreground mt-2">Score moyen de vos sessions</p>
                </div>
            </div>

            <div className="mt-4">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <p className="text-muted-foreground animate-pulse font-bold">Chargement de vos formations...</p>
                    </div>
                ) : (
                    <Tabs defaultValue={actionRequiredSessions.length > 0 ? "actions" : "upcoming"} className="w-full">
                        <TabsList className="bg-transparent border-b border-border rounded-none h-auto p-0 gap-8 mb-8">
                            <TabsTrigger
                                value="actions"
                                className="relative bg-transparent border-none shadow-none data-[state=active]:shadow-none data-[state=active]:bg-transparent rounded-none px-0 py-4 text-sm font-bold data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary transition-all"
                            >
                                Actions requises
                                {actionRequiredSessions.length > 0 && (
                                    <span className="ml-2 bg-primary text-white text-[10px] px-1.5 py-0.5 rounded-full ring-4 ring-orange-50">
                                        {actionRequiredSessions.length}
                                    </span>
                                )}
                            </TabsTrigger>
                            <TabsTrigger
                                value="upcoming"
                                className="bg-transparent border-none shadow-none data-[state=active]:shadow-none data-[state=active]:bg-transparent rounded-none px-0 py-4 text-sm font-bold data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary transition-all"
                            >
                                À venir ({upcomingSessions.length})
                            </TabsTrigger>
                            <TabsTrigger
                                value="completed"
                                className="bg-transparent border-none shadow-none data-[state=active]:shadow-none data-[state=active]:bg-transparent rounded-none px-0 py-4 text-sm font-bold data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary transition-all"
                            >
                                Historique ({completedSessions.length})
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="actions" className="mt-0 outline-none">
                            {actionRequiredSessions.length > 0 ? (
                                <div className="grid gap-6">
                                    {actionRequiredSessions.map((session) => (
                                        <SessionCard key={session.id} session={session} isActionRequired={true} />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-20 bg-muted/20 rounded-[2rem] border border-dashed border-border">
                                    <p className="text-muted-foreground font-bold italic">Tout est à jour ! Aucune action requise.</p>
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="upcoming" className="mt-0 outline-none">
                            {upcomingSessions.length > 0 ? (
                                <div className="grid gap-6">
                                    {upcomingSessions.map((session) => (
                                        <SessionCard key={session.id} session={session} />
                                    ))}
                                </div>
                            ) : (
                                <div className="py-20 text-center bg-muted/10 rounded-[2rem] border border-border">
                                    <p className="mb-6 font-bold text-muted-foreground">Vous n&apos;avez pas de sessions à venir.</p>
                                    <Button asChild className="rounded-xl font-bold shadow-lg shadow-primary/20">
                                        <Link href="/catalogue">Parcourir le catalogue</Link>
                                    </Button>
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="completed" className="mt-0 outline-none">
                            {completedSessions.length > 0 ? (
                                <div className="grid gap-6 transition-all grayscale-[0.5] hover:grayscale-0">
                                    {completedSessions.map((session) => (
                                        <SessionCard key={session.id} session={session} />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-20">
                                    <p className="text-muted-foreground font-bold">Aucune session terminée à afficher.</p>
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                )}
            </div>
        </div>
    )
}
