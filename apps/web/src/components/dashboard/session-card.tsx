"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge } from "@/components/ui/status-badge"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import Link from "next/link"
import { cn } from "@/lib/utils"

export type Session = {
    id: string
    date: string
    slot: string
    status: string
    formation: {
        title: string
        programLink?: string | null
        durationType?: string
    }
    trainer?: {
        firstName: string
        lastName: string
    }
    logistics?: string | null
    participants?: string | null
    location?: string | null
}

interface SessionCardProps {
    session: Session
    isActionRequired?: boolean
}

export function SessionCard({ session, isActionRequired }: SessionCardProps) {
    return (
        <div className={cn(
            "group relative overflow-hidden bg-white border rounded-[2rem] transition-all duration-300 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1",
            isActionRequired ? "border-primary/30 bg-orange-50/20" : "border-border shadow-sm"
        )}>
            {/* Action Required Accent */}
            {isActionRequired && (
                <div className="absolute top-0 left-0 w-1.5 h-full bg-primary" />
            )}

            <div className="p-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-4 flex-1">
                        <div className="flex items-center gap-4">
                            <h3 className="text-2xl font-bold tracking-tight group-hover:text-primary transition-colors">
                                {session.formation.title}
                            </h3>
                            <StatusBadge status={session.status} />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-border/50">
                            <div className="space-y-1">
                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Date & Créneau</span>
                                <div className="flex flex-col">
                                    <span className="font-bold text-foreground">
                                        {format(new Date(session.date), "EEEE d MMMM yyyy", { locale: fr })}
                                    </span>
                                    <span className="text-xs font-bold text-primary bg-primary/5 w-fit px-2 py-0.5 rounded mt-1 uppercase">
                                        {session.slot === 'ALL_DAY' ? 'Journée entière' : session.slot}
                                    </span>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Formateur</span>
                                <p className="font-bold text-foreground">
                                    {session.trainer
                                        ? `${session.trainer.firstName} ${session.trainer.lastName}`
                                        : "En attente d'assignation"}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
                        {session.formation.programLink && (
                            <Button variant="ghost" size="sm" asChild className="font-bold text-xs hover:bg-primary/5 text-muted-foreground hover:text-primary">
                                <a href={session.formation.programLink} target="_blank" rel="noopener noreferrer">
                                    Programme PDF
                                </a>
                            </Button>
                        )}

                        <Button asChild className={cn(
                            "font-bold rounded-xl px-6 h-12 shadow-lg transition-all active:scale-95",
                            isActionRequired
                                ? "bg-primary text-white shadow-primary/20"
                                : "bg-white border border-border text-foreground hover:border-primary hover:text-primary hover:bg-primary/5 shadow-none"
                        )}>
                            <Link href={`/dashboard/sessions/${session.id}`}>
                                {isActionRequired ? "Compléter la logistique" : "Détails Session"}
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
