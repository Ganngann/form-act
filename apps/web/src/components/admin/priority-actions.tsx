"use client";

import { useEffect, useState } from "react";
import { API_URL } from "@/lib/config";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, UserPlus, FileText, CreditCard, ChevronRight, Loader2 } from "lucide-react";
import Link from "next/link";

interface ActionStats {
    pendingRequests: number;
    noTrainer: number;
    missingLogistics: number;
    missingProof: number;
    readyToBill: number;
}

export function PriorityActions() {
    const [stats, setStats] = useState<ActionStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${API_URL}/sessions/admin/stats`, { credentials: "include" })
            .then(res => res.json())
            .then(data => setStats(data))
            .catch(err => console.error("Failed to fetch admin stats", err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <Card key={i} className="animate-pulse bg-slate-50 border-dashed">
                        <CardContent className="h-24" />
                    </Card>
                ))}
            </div>
        );
    }

    if (!stats) return null;

    const actions = [
        {
            title: "À valider",
            description: "Demandes de réservation en attente",
            count: stats.pendingRequests,
            icon: AlertCircle,
            color: "text-orange-600",
            bgColor: "bg-orange-50",
            borderColor: "border-orange-100",
            href: "/admin/sessions?status=PENDING",
            priority: stats.pendingRequests > 0 ? "high" : "none"
        },
        {
            title: "Sans formateur",
            description: "Sessions confirmées nécessitant un formateur",
            count: stats.noTrainer,
            icon: UserPlus,
            color: "text-red-600",
            bgColor: "bg-red-50",
            borderColor: "border-red-100",
            href: "/admin/sessions?filter=NO_TRAINER",
            priority: stats.noTrainer > 0 ? "high" : "none"
        },
        {
            title: "Logistique J-7",
            description: "Informations d'accès manquantes (J-7)",
            count: stats.missingLogistics,
            icon: FileText,
            color: "text-blue-600",
            bgColor: "bg-blue-50",
            borderColor: "border-blue-100",
            href: "/admin/sessions?filter=MISSING_LOGISTICS",
            priority: stats.missingLogistics > 0 ? "medium" : "none"
        },
        {
            title: "À facturer",
            description: "Prêt pour facturation (Preuve reçue)",
            count: stats.readyToBill,
            icon: CreditCard,
            color: "text-green-600",
            bgColor: "bg-green-50",
            borderColor: "border-green-100",
            href: "/admin/sessions?filter=READY_TO_BILL",
            priority: stats.readyToBill > 0 ? "low" : "none"
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {actions.map((action, idx) => (
                <Link key={idx} href={action.href}>
                    <Card className={`group h-full hover:shadow-md transition-all border ${action.borderColor} ${action.count > 0 ? 'opacity-100' : 'opacity-60 grayscale-[0.5]'}`}>
                        <CardContent className="p-4 flex flex-col justify-between h-full">
                            <div className="flex items-start justify-between mb-4">
                                <div className={`p-2 rounded-lg ${action.bgColor} ${action.color}`}>
                                    <action.icon className="h-5 w-5" />
                                </div>
                                <p className={`text-2xl font-bold ${action.count > 0 ? action.color : 'text-slate-400'}`}>
                                    {action.count}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-800 flex items-center gap-1 group-hover:text-blue-600 transition-colors">
                                    {action.title}
                                    <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1" />
                                </p>
                                <p className="text-[11px] leading-tight text-slate-500 mt-0.5">
                                    {action.description}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </Link>
            ))}
        </div>
    );
}
