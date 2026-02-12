"use client"

import { AlertTriangle, BellRing } from "lucide-react"
import { differenceInCalendarDays } from "date-fns"
import { cn } from "@/lib/utils"

interface DashboardAlertsProps {
    alerts: {
        type: 'missing-participants';
        count: number;
        earliestDate: Date;
    }[]
}

export function DashboardAlerts({ alerts }: DashboardAlertsProps) {
    if (!alerts || alerts.length === 0) return null;

    const now = new Date();

    return (
        <div className="space-y-4 mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
            {alerts.map((alert, index) => {
                if (alert.type === 'missing-participants') {
                    const daysDiff = differenceInCalendarDays(alert.earliestDate, now);
                    const isCritical = daysDiff < 9;

                    return (
                        <div
                            key={index}
                            className={cn(
                                "relative overflow-hidden p-6 rounded-[2rem] border transition-all duration-300",
                                isCritical
                                    ? "bg-red-50/50 border-red-200"
                                    : "bg-orange-50/50 border-primary/20"
                            )}
                            role="alert"
                        >
                            <div className="flex items-center gap-6">
                                <div className={cn(
                                    "h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg",
                                    isCritical ? "bg-red-500 shadow-red-200" : "bg-primary shadow-primary/20"
                                )}>
                                    <AlertTriangle className="h-6 w-6 text-white" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={cn(
                                            "text-[10px] font-black uppercase tracking-[2px]",
                                            isCritical ? "text-red-600" : "text-primary"
                                        )}>
                                            {isCritical ? "Action Prioritaire" : "Action Requise"}
                                        </span>
                                        {isCritical && (
                                            <span className="flex h-2 w-2 rounded-full bg-red-600 animate-pulse" />
                                        )}
                                    </div>
                                    <h4 className={cn(
                                        "text-xl font-bold",
                                        isCritical ? "text-red-900" : "text-foreground"
                                    )}>
                                        Liste des participants manquante
                                    </h4>
                                    <p className={cn(
                                        "text-sm font-medium mt-1 leading-relaxed",
                                        isCritical ? "text-red-700/80" : "text-muted-foreground"
                                    )}>
                                        Il manque les participants pour {alert.count} formation(s).
                                        {alert.count === 1 ? " La session est prévue le " : " La plus urgente attendue pour le "}
                                        <span className="font-black underline decoration-2 underline-offset-4">
                                            {alert.earliestDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
                                        </span>.
                                    </p>
                                </div>
                                <div className="hidden md:block">
                                    <div className={cn(
                                        "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider",
                                        isCritical ? "bg-red-100 text-red-700" : "bg-primary/10 text-primary"
                                    )}>
                                        J - {daysDiff}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                }
                return null
            })}
        </div>
    )
}
