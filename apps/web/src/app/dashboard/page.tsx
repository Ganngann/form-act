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
        if (!s.location || s.location.trim() === '') return true;
        if (!s.logistics) return true;
        try {
            const log = JSON.parse(s.logistics);
            if (log.wifi !== 'yes' && log.wifi !== 'no') return true;
            if (log.subsidies !== 'yes' && log.subsidies !== 'no') return true;
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
        if (sessionDate < now) return false;
        const daysDiff = differenceInCalendarDays(sessionDate, now);
        if (isLogisticsStrictlyIncomplete(s)) return true;
        if (isParticipantsIncomplete(s) && daysDiff < 15) return true;
        return false;
    };

    // Data Filtering
    const actionRequiredSessions = sessions.filter(isActionRequired);
    const upcomingSessions = sessions.filter(s => {
        const sessionDate = new Date(s.date);
        sessionDate.setHours(0, 0, 0, 0);
        return sessionDate >= now && !isActionRequired(s);
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const completedSessions = sessions.filter(s => {
        const sessionDate = new Date(s.date);
        sessionDate.setHours(0, 0, 0, 0);
        return sessionDate < now;
    });

    // Stats Calculation
    const totalParticipants = completedSessions.reduce((acc, s) => {
        try {
            const parts = s.participants ? JSON.parse(s.participants) : [];
            return acc + (Array.isArray(parts) ? parts.length : 0);
        } catch { return acc; }
    }, 0);

    const totalTrainingDays = completedSessions.reduce((acc, s) => {
        const type = s.formation.durationType;
        return acc + (type === 'ALL_DAY' ? 1 : 0.5);
    }, 0);

    const nextSessionDays = upcomingSessions.length > 0
        ? differenceInCalendarDays(new Date(upcomingSessions[0].date), now)
        : null;

    return (
        <div className="flex flex-col gap-12 animate-in fade-in duration-700">
            <div className="flex flex-col gap-2 px-4">
                <span className="text-[10px] font-black text-primary uppercase tracking-[2px]">Espace Client</span>
                <h1 className="text-5xl font-bold tracking-tighter">Mon Dashboard.</h1>
            </div>

            {/* Bento Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-4 gap-6 px-4">
                {/* Main: Next Session (Col 1-2, Row 1-2) */}
                <div className="md:col-span-2 md:row-span-2 p-10 bg-white border border-border rounded-[2.5rem] flex flex-col justify-between group hover:border-primary transition-all duration-500 shadow-sm hover:translate-y-[-4px]">
                    <div className="flex justify-between items-start">
                        <div>
                            <span className="text-[10px] font-black text-primary uppercase tracking-[2px]">Ma prochaine formation</span>
                            {upcomingSessions.length > 0 ? (
                                <h3 className="text-4xl font-bold mt-4 leading-tight group-hover:text-primary transition-colors">
                                    {upcomingSessions[0].formation.title}
                                </h3>
                            ) : (
                                <h3 className="text-3xl font-bold mt-4 leading-tight text-muted-foreground/30 italic">Aucune session en attente...</h3>
                            )}
                        </div>
                        {nextSessionDays !== null && (
                            <div className="bg-primary/5 text-primary px-3 py-1.5 rounded-lg font-mono text-sm font-bold border border-primary/20">
                                J - {nextSessionDays}
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-4 mt-12 pb-2">
                        <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center border border-border/50 shadow-inner">
                            <User className="h-7 w-7 text-muted-foreground/40" />
                        </div>
                        <div>
                            <p className="font-bold text-xl leading-none">
                                {upcomingSessions[0]?.trainer ? `${upcomingSessions[0].trainer.firstName} ${upcomingSessions[0].trainer.lastName}` : "Expert à venir"}
                            </p>
                            <p className="text-sm text-muted-foreground mt-2 font-medium">
                                {upcomingSessions[0] ? new Date(upcomingSessions[0].date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : "-- -- --"}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Actions: Alert Section (Col 3-4, Row 1) */}
                <div className="md:col-span-2 p-8 bg-orange-50/20 border border-orange-100 rounded-[2.5rem] flex items-center justify-between group hover:border-primary transition-all">
                    <div className="flex items-center gap-6">
                        <div className="h-14 w-14 rounded-full bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20 shrink-0">
                            <FileText className="h-7 w-7" />
                        </div>
                        <div>
                            <h4 className="text-xl font-bold leading-tight">Action Requise</h4>
                            <p className="text-sm text-muted-foreground mt-1 max-w-[200px]">
                                {actionRequiredSessions.length > 0
                                    ? `Vous avez ${actionRequiredSessions.length} dossier${actionRequiredSessions.length > 1 ? 's' : ''} à compléter.`
                                    : "Tous vos dossiers sont à jour."}
                            </p>
                        </div>
                    </div>
                    {actionRequiredSessions.length > 0 && (
                        <Button variant="default" className="rounded-xl font-bold shadow-lg shadow-primary/20 px-6">
                            Remplir maintenant
                        </Button>
                    )}
                </div>

                {/* Stats: Participants (Col 3, Row 2) */}
                <div className="md:col-span-1 p-8 bg-white border border-border rounded-[2.5rem] flex flex-col justify-center items-center text-center group hover:border-primary transition-all">
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[1px] mb-3">Participants</span>
                    <span className="text-5xl font-black tracking-tighter">{totalParticipants}</span>
                    <p className="text-[9px] font-bold text-muted-foreground/40 uppercase mt-4 tracking-widest">Experts Formés</p>
                </div>

                {/* Stats: Volume (Col 4, Row 2) */}
                <div className="md:col-span-1 p-8 bg-white border border-border rounded-[2.5rem] flex flex-col justify-center items-center text-center group hover:border-primary transition-all">
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[1px] mb-3">Volume</span>
                    <div className="flex items-baseline gap-1">
                        <span className="text-5xl font-black tracking-tighter">{totalTrainingDays}</span>
                        <span className="text-lg font-bold text-muted-foreground">j</span>
                    </div>
                    <p className="text-[9px] font-bold text-muted-foreground/40 uppercase mt-4 tracking-widest">Temps Formation</p>
                </div>
            </div>

            {/* Sessions Tabs Section */}
            <div className="px-4 mt-8">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <p className="text-muted-foreground animate-pulse font-bold tracking-widest uppercase text-xs">Chargement de vos formations...</p>
                    </div>
                ) : (
                    <Tabs defaultValue={actionRequiredSessions.length > 0 ? "actions" : "upcoming"} className="w-full">
                        <TabsList className="bg-transparent border-b border-border rounded-none h-auto p-0 gap-10 mb-10">
                            <TabsTrigger
                                value="actions"
                                className="relative bg-transparent border-none shadow-none rounded-none px-0 py-4 text-sm font-black data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary transition-all"
                            >
                                Urgents
                                {actionRequiredSessions.length > 0 && (
                                    <span className="ml-2 bg-primary text-white text-[10px] px-1.5 py-0.5 rounded-full ring-4 ring-orange-50">
                                        {actionRequiredSessions.length}
                                    </span>
                                )}
                            </TabsTrigger>
                            <TabsTrigger
                                value="upcoming"
                                className="bg-transparent border-none shadow-none rounded-none px-0 py-4 text-sm font-black data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary transition-all"
                            >
                                À venir ({upcomingSessions.length})
                            </TabsTrigger>
                            <TabsTrigger
                                value="completed"
                                className="bg-transparent border-none shadow-none rounded-none px-0 py-4 text-sm font-black data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary transition-all"
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
                                <div className="text-center py-24 bg-white rounded-[2.5rem] border border-dashed border-border/60">
                                    <p className="text-muted-foreground font-black uppercase text-xs tracking-widest opacity-40">Tout est à jour !</p>
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
                                <div className="py-24 text-center bg-white rounded-[2.5rem] border border-border/40">
                                    <p className="mb-8 font-bold text-muted-foreground italic">Aucune session planifiée pour le moment.</p>
                                    <Button asChild className="rounded-2xl font-black h-14 px-10 shadow-xl shadow-primary/20">
                                        <Link href="/catalogue">Explorer le catalogue</Link>
                                    </Button>
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="completed" className="mt-0 outline-none">
                            {completedSessions.length > 0 ? (
                                <div className="grid gap-6 transition-all opacity-80 hover:opacity-100">
                                    {completedSessions.map((session) => (
                                        <SessionCard key={session.id} session={session} />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-24 bg-muted/5 rounded-[2.5rem] border border-border/40">
                                    <p className="text-muted-foreground font-bold uppercase text-[10px] tracking-widest">Aucune session archivée.</p>
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                )}
            </div>
        </div>
    )
}

