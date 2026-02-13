"use client";

import { Session, Formation, Client, Formateur } from "@/types/formation"; // Need to ensure these types exist or define locally
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Calendar, User, Building2, CheckCircle2, Circle, AlertCircle, Clock, CreditCard, FileText, ChevronRight } from "lucide-react";
import Link from "next/link";
import { format, differenceInDays } from "date-fns";
import { fr } from "date-fns/locale";

interface SessionRadarCardProps {
    session: any; // Using any for now to avoid type errors if types are not fully defined
}

export function SessionRadarCard({ session }: SessionRadarCardProps) {
    const sessionDate = new Date(session.date);
    const now = new Date();
    const daysUntil = differenceInDays(sessionDate, now);

    // Zone A: Radar (Urgency)
    const isPast = sessionDate < now;
    const urgencyLabel = isPast ? `J+${Math.abs(daysUntil)}` : `J-${daysUntil}`;

    let radarColor = "bg-slate-100 text-slate-600";
    if (!isPast) {
        if (daysUntil < 3) radarColor = "bg-red-600 text-white animate-pulse shadow-lg shadow-red-200";
        else if (daysUntil < 7) radarColor = "bg-orange-500 text-white";
        else if (daysUntil < 14) radarColor = "bg-amber-400 text-white";
        else radarColor = "bg-emerald-500 text-white";
    } else {
        radarColor = "bg-slate-800 text-slate-300";
    }

    // Zone C: Pipeline Logic
    const steps = [
        { label: "Info", done: !!session.location && !!session.slot },
        { label: "Formateur", done: !!session.trainerId },
        { label: "Logistique", done: !!session.logistics && JSON.parse(session.logistics || "{}").complete },
        { label: "Présence", done: !!session.proofUrl },
        { label: "Facture", done: !!session.billedAt },
    ];

    // Determine Action Message
    let actionMessage = "Tout est en ordre";
    let actionStatus: "ok" | "warn" | "error" = "ok";

    if (!session.trainerId) {
        actionMessage = "À ASSIGNER";
        actionStatus = "error";
    } else if (daysUntil < 14 && (!session.logistics || !JSON.parse(session.logistics || "{}").complete)) {
        actionMessage = "⚠️ LOGISTIQUE À FINALISER";
        actionStatus = "warn";
    } else if (isPast && !session.proofUrl) {
        actionMessage = "DOCUMENTS DE PRÉSENCE REQUIS";
        actionStatus = "error";
    } else if (session.proofUrl && !session.billedAt) {
        actionMessage = "PRÊT À FACTURER";
        actionStatus = "ok";
    }

    const finalPrice = session.billingData ? JSON.parse(session.billingData).finalPrice : (session.formation.price || 0);

    return (
        <Card className="overflow-hidden border-none shadow-md hover:shadow-xl transition-all duration-300 group rounded-2xl bg-white mb-4">
            <div className="flex flex-col md:flex-row min-h-[140px]">
                {/* Zone A: Radar */}
                <div className={cn(
                    "md:w-32 flex flex-col items-center justify-center p-4 transition-colors duration-500 shrink-0",
                    radarColor
                )}>
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-1">
                        {isPast ? "Passé" : "Début"}
                    </span>
                    <span className="text-3xl font-black tracking-tighter">
                        {urgencyLabel}
                    </span>
                    <div className="mt-2 text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-full">
                        {format(sessionDate, "dd MMM", { locale: fr })}
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 p-5 flex flex-col md:flex-row gap-6">

                    {/* Zone B: Identity */}
                    <div className="flex-1 space-y-2 min-w-0">
                        <div>
                            <h3 className="text-lg font-black text-slate-900 truncate leading-tight group-hover:text-primary transition-colors">
                                {session.formation.title}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                                <Building2 className="h-3.5 w-3.5 text-slate-400" />
                                <span className="text-sm font-bold text-slate-500 truncate">
                                    {session.client?.companyName || "Client inconnu"}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 pt-1">
                            <div className={cn(
                                "h-8 w-8 rounded-full flex items-center justify-center",
                                session.trainer ? "bg-slate-100 text-slate-600" : "bg-amber-100 text-amber-600 border border-amber-200"
                            )}>
                                <User className="h-4 w-4" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none mb-0.5">Formateur</span>
                                <span className={cn(
                                    "text-xs font-black",
                                    session.trainer ? "text-slate-700" : "text-amber-600"
                                )}>
                                    {session.trainer ? `${session.trainer.firstName} ${session.trainer.lastName}` : "À ASSIGNER"}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Zone C: Pipeline */}
                    <div className="w-full md:w-64 space-y-3">
                        <div className={cn(
                            "text-[10px] font-black tracking-widest uppercase py-1 px-3 rounded-md inline-block",
                            actionStatus === "ok" ? "bg-emerald-50 text-emerald-600" :
                                actionStatus === "warn" ? "bg-amber-50 text-amber-600 border border-amber-100" :
                                    "bg-red-50 text-red-600 border border-red-100"
                        )}>
                            {actionMessage}
                        </div>

                        <div className="flex items-center justify-between gap-1 mt-2">
                            {steps.map((step, idx) => (
                                <div key={idx} className="flex flex-col items-center gap-1 group/step">
                                    <div className={cn(
                                        "h-2 w-full rounded-full min-w-[36px]",
                                        step.done ? "bg-emerald-500" :
                                            (idx === steps.findIndex(s => !s.done) ? "bg-orange-400 animate-pulse" : "bg-slate-100")
                                    )} />
                                    <span className={cn(
                                        "text-[8px] font-black uppercase tracking-tighter",
                                        step.done ? "text-emerald-600" :
                                            (idx === steps.findIndex(s => !s.done) ? "text-orange-500" : "text-slate-300")
                                    )}>
                                        {step.label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Zone D & E: Synthesis & Action */}
                    <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-4 shrink-0 md:pl-6 md:border-l border-slate-100">
                        <div className="text-right">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Total HT</span>
                            <span className="text-xl font-black text-slate-900 tracking-tighter">
                                {finalPrice}€
                            </span>
                        </div>

                        <Button size="sm" asChild className="rounded-xl font-black tracking-tight px-4 hover:translate-x-1 transition-transform">
                            <Link href={`/admin/sessions/${session.id}`}>
                                GÉRER <ChevronRight className="ml-1 h-3.5 w-3.5" />
                            </Link>
                        </Button>
                    </div>

                </div>
            </div>
        </Card>
    );
}
