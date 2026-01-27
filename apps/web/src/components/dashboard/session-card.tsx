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
        <Card className={cn(isActionRequired && "border-l-4 border-l-yellow-500")}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-bold">
                    {session.formation.title}
                </CardTitle>
                <StatusBadge status={session.status} />
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mt-2">
                    <div>
                        <p className="text-muted-foreground">Date & Créneau</p>
                        <p className="font-medium">
                            {format(new Date(session.date), "EEEE d MMMM yyyy", { locale: fr })}
                            <br />
                            <span className="text-xs uppercase px-1.5 py-0.5 bg-secondary rounded mt-1 inline-block">
                                {session.slot}
                            </span>
                        </p>
                    </div>
                    <div>
                        <p className="text-muted-foreground">Formateur</p>
                        <p className="font-medium">
                            {session.trainer
                                ? `${session.trainer.firstName} ${session.trainer.lastName}`
                                : "En attente d'assignation"}
                        </p>
                    </div>
                    <div className="flex flex-col gap-2 items-end justify-end">
                        <div className="flex gap-2">
                            {session.formation.programLink && (
                                <a
                                    href={session.formation.programLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <Button variant="outline" size="sm">
                                        Programme (PDF)
                                    </Button>
                                </a>
                            )}

                            {isActionRequired ? (
                                <Link href={`/dashboard/sessions/${session.id}`}>
                                    <Button size="sm" className="bg-yellow-600 hover:bg-yellow-700 text-white">
                                        Compléter la logistique
                                    </Button>
                                </Link>
                            ) : (
                                <Link href={`/dashboard/sessions/${session.id}`}>
                                    <Button variant="outline" size="sm">Détails</Button>
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
