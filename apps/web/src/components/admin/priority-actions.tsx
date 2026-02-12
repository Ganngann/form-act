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
                    <Card className={`group h-full shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border ${action.borderColor} ${action.count > 0 ? 'opacity-100 bg-white' : 'opacity-60 grayscale-[0.5] bg-muted/20'} rounded-[2rem] overflow-hidden`}>
                        <CardContent className="p-6 flex flex-col justify-between h-full relative">
                            {/* Background accent */}
                            <div className={`absolute top-0 right-0 w-24 h-24 ${action.bgColor} rounded-full blur-3xl -mr-10 -mt-10 opacity-50 group-hover:opacity-100 transition-opacity`}></div>

                            <div className="flex items-start justify-between mb-6 relative z-10">
                                <div className={`h-12 w-12 rounded-2xl ${action.bgColor} ${action.color} flex items-center justify-center border border-white/50 shadow-sm`}>
                                    <action.icon className="h-6 w-6" />
                                </div>
                                <div className={`px-3 py-1 rounded-full text-xs font-black ${action.bgColor} ${action.color}`}>
                                    {action.count}
                                </div>
                            </div>

                            <div className="relative z-10">
                                <p className="text-lg font-black text-gray-900 group-hover:text-primary transition-colors mb-1 flex items-center gap-2">
                                    {action.title}
                                </p>
                                <p className="text-sm font-medium text-muted-foreground leading-relaxed">
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
