"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge } from "@/components/ui/status-badge"
import { API_URL } from "@/lib/config"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { LogoutButton } from "@/components/LogoutButton"

type Session = {
    id: string
    date: string
    slot: string
    status: string
    formation: {
        title: string
    }
    trainer?: {
        firstName: string
        lastName: string
    }
}

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

    return (
        <div className="container mx-auto py-10 px-4">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Mon Espace Client</h1>
            </div>

            <div className="grid gap-6">
                <h2 className="text-xl font-semibold">Mes Sessions de Formation</h2>

                {loading ? (
                    <p>Chargement de vos formations...</p>
                ) : sessions.length > 0 ? (
                    <div className="grid gap-4">
                        {sessions.map((session) => (
                            <Card key={session.id}>
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
                                        <div className="flex items-end justify-end">
                                            <Link href={`/dashboard/sessions/${session.id}`}>
                                                <Button variant="outline" size="sm">Détails</Button>
                                            </Link>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Card>
                        <CardContent className="py-10 text-center text-muted-foreground">
                            <p className="mb-4">Vous n&apos;avez pas encore de sessions de formation réservées.</p>
                            <Link href="/catalogue" className="text-primary hover:underline font-medium">
                                Parcourir le catalogue
                            </Link>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}
