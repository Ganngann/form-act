"use client";

import { useEffect, useState } from "react";
import { API_URL } from "@/lib/config";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, UserPlus, FileText, CreditCard, ChevronRight, Loader2, CheckCircle2, Clock } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface ActionStats {
    pendingRequests: number;
    noTrainer: number;
    missingLogistics: number;
    missingProof: number;
    readyToBill: number;
}

interface AdminBentoStatsProps {
    activeFilter?: string;
}

export function AdminBentoStats({ activeFilter }: AdminBentoStatsProps) {
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
                    <div key={i} className="h-32 rounded-[2rem] bg-slate-100 animate-pulse" />
                ))}
            </div>
        );
    }

    if (!stats) return null;

    const bentoItems = [
        {
            id: "NO_TRAINER",
            label: "Assignations",
            count: stats.noTrainer,
            sublabel: "Sans formateur assigné",
            icon: UserPlus,
            color: "bg-red-500",
            lightColor: "bg-red-50",
            textColor: "text-red-600",
            borderColor: "border-red-100",
            href: "/admin/sessions?filter=NO_TRAINER"
        },
        {
            id: "MISSING_LOGISTICS",
            label: "Logistique (J-14)",
            count: stats.missingLogistics,
            sublabel: "Dossiers incomplets",
            icon: FileText,
            color: "bg-orange-500",
            lightColor: "bg-orange-50",
            textColor: "text-orange-600",
            borderColor: "border-orange-100",
            href: "/admin/sessions?filter=MISSING_LOGISTICS"
        },
        {
            id: "MISSING_PROOF",
            label: "Émargements",
            count: stats.missingProof,
            sublabel: "Preuves manquantes",
            icon: Clock,
            color: "bg-amber-500",
            lightColor: "bg-amber-50",
            textColor: "text-amber-600",
            borderColor: "border-amber-100",
            href: "/admin/sessions?filter=MISSING_PROOF"
        },
        {
            id: "READY_TO_BILL",
            label: "À Facturer",
            count: stats.readyToBill,
            sublabel: "Sessions à clôturer",
            icon: CreditCard,
            color: "bg-emerald-500",
            lightColor: "bg-emerald-50",
            textColor: "text-emerald-600",
            borderColor: "border-emerald-100",
            href: "/admin/sessions?filter=READY_TO_BILL"
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {bentoItems.map((item) => {
                const isActive = activeFilter === item.id;
                const Icon = item.icon;

                return (
                    <Link key={item.id} href={item.href} className="group">
                        <Card className={cn(
                            "relative overflow-hidden border-2 transition-all duration-300 rounded-[2rem] h-full shadow-sm hover:shadow-md",
                            isActive ? "border-primary ring-2 ring-primary/20 scale-[1.02]" : cn("border-transparent hover:border-slate-200", item.count === 0 && "opacity-60")
                        )}>
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className={cn(
                                        "p-3 rounded-2xl transition-transform duration-300 group-hover:scale-110",
                                        item.color, "text-white shadow-lg"
                                    )}>
                                        <Icon className="h-5 w-5" />
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-3xl font-black tracking-tighter text-slate-900 leading-none">
                                            {item.count}
                                        </span>
                                        {isActive && (
                                            <span className="text-[10px] font-black uppercase tracking-widest text-primary mt-1 flex items-center gap-1">
                                                <CheckCircle2 className="h-3 w-3" /> Actif
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-800">
                                        {item.label}
                                    </h3>
                                    <p className="text-[11px] font-bold text-slate-400 mt-0.5">
                                        {item.sublabel}
                                    </p>
                                </div>

                                {/* Background Decoration */}
                                <div className={cn(
                                    "absolute -bottom-6 -right-6 w-24 h-24 rounded-full blur-3xl opacity-20 transition-opacity group-hover:opacity-40",
                                    item.color
                                )}></div>
                            </CardContent>
                        </Card>
                    </Link>
                );
            })}
        </div>
    );
}
