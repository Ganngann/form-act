"use client"

import { AlertTriangle } from "lucide-react"
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
        <div className="space-y-4 mb-6">
            {alerts.map((alert, index) => {
                if (alert.type === 'missing-participants') {
                    const daysDiff = differenceInCalendarDays(alert.earliestDate, now);
                    const isCritical = daysDiff < 9;

                    return (
                        <div
                            key={index}
                            className={cn(
                                "border-l-4 p-4",
                                isCritical
                                    ? "bg-red-50 border-red-500 text-red-700"
                                    : "bg-orange-50 border-orange-500 text-orange-700"
                            )}
                            role="alert"
                        >
                            <div className="flex items-center">
                                <AlertTriangle className={cn("h-5 w-5 mr-2", isCritical ? "text-red-700" : "text-orange-700")} />
                                <p className="font-bold">Attention</p>
                            </div>
                            <p className="text-sm mt-1">
                                Liste des participants manquante pour {alert.count} formation(s).
                                {alert.count === 1 ? " La prochaine est prévue le " : " La plus urgente est le "}
                                {alert.earliestDate.toLocaleDateString('fr-FR')}.
                            </p>
                        </div>
                    )
                }
                return null
            })}
        </div>
    )
}
