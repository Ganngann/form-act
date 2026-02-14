"use client";

import { Package, Wifi, FileText, Tv } from "lucide-react";

interface LogisticsSummaryProps {
    logistics: string | null;
}

export function LogisticsSummary({ logistics }: LogisticsSummaryProps) {
    if (!logistics) {
        return (
            <p className="text-muted-foreground italic text-sm p-4 bg-muted/20 rounded-xl">
                Aucune information logistique renseignée.
            </p>
        );
    }

    try {
        const log = JSON.parse(logistics);
        return (
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-muted/10 p-3 rounded-xl border border-border/50">
                        <span className="text-xs font-bold text-muted-foreground uppercase mb-1 block">Wifi</span>
                        <div className="flex items-center gap-2 font-bold text-gray-900">
                            <Wifi className="h-4 w-4 text-primary" />
                            {log.wifi === "yes" ? "Oui" : "Non"}
                        </div>
                    </div>
                    <div className="bg-muted/10 p-3 rounded-xl border border-border/50">
                        <span className="text-xs font-bold text-muted-foreground uppercase mb-1 block">Subsides</span>
                        <div className="flex items-center gap-2 font-bold text-gray-900">
                            <FileText className="h-4 w-4 text-primary" />
                            {log.subsidies === "yes" ? "Oui" : "Non"}
                        </div>
                    </div>
                </div>

                {(log.videoMaterial?.length > 0 || log.writingMaterial?.length > 0) && (
                    <div className="bg-muted/10 p-4 rounded-xl border border-border/50 space-y-3">
                        {log.videoMaterial?.length > 0 && (
                            <div>
                                <span className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-2 mb-1">
                                    <Tv className="h-3 w-3" /> Vidéo
                                </span>
                                <p className="text-sm font-medium">{log.videoMaterial.join(", ")}</p>
                            </div>
                        )}
                        {log.writingMaterial?.length > 0 && (
                            <div>
                                <span className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-2 mb-1">
                                    <FileText className="h-3 w-3" /> Écritture
                                </span>
                                <p className="text-sm font-medium">{log.writingMaterial.join(", ")}</p>
                            </div>
                        )}
                    </div>
                )}

                {log.accessDetails && (
                    <div className="bg-orange-50/50 p-4 rounded-xl border border-orange-100 text-sm">
                        <span className="font-bold text-orange-800 block mb-1">Accès & Notes</span>
                        <p className="text-orange-900/80 whitespace-pre-wrap">{log.accessDetails}</p>
                    </div>
                )}
            </div>
        );
    } catch (e) {
        return <pre className="text-xs p-4 bg-red-50 text-red-600 rounded-xl">{logistics}</pre>;
    }
}
