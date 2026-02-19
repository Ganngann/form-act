"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Participant } from "@/types/formation";

interface ParticipantsSummaryProps {
    participants?: string | null;
}

export function ParticipantsSummary({ participants }: ParticipantsSummaryProps) {
    if (!participants) {
        return (
            <p className="text-muted-foreground italic text-sm p-4 bg-muted/20 rounded-xl">
                Liste vide pour le moment.
            </p>
        );
    }

    try {
        const parts = JSON.parse(participants);
        if (!Array.isArray(parts) || parts.length === 0) {
            return (
                <p className="text-muted-foreground italic text-sm p-4 bg-muted/20 rounded-xl">
                    Aucun participant inscrit.
                </p>
            );
        }

        return (
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {parts.map((p: Participant, i: number) => {
                    const initials = ((p.firstName?.[0] || "") + (p.lastName?.[0] || "")).toUpperCase();
                    return (
                        <div key={i} className="flex items-center gap-3 p-3 bg-muted/5 hover:bg-muted/20 rounded-xl border border-border/40 transition-colors">
                            <Avatar className="h-8 w-8 border border-border">
                                <AvatarFallback className="bg-blue-100 text-blue-600 font-bold text-xs">
                                    {initials || 'P'}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-bold text-sm text-gray-900">{p.firstName || p.name} {p.lastName}</p>
                                {p.email && <p className="text-xs text-muted-foreground">{p.email}</p>}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    } catch (e) {
        return <p className="text-destructive text-sm font-bold p-4 bg-red-50 rounded-xl">Erreur de format des participants</p>;
    }
}
