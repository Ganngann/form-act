"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { API_URL } from "@/lib/config";
import { Button } from "@/components/ui/button";
import { Loader2, Euro } from "lucide-react";

interface ClientOfferValidationProps {
    session: {
        id: string;
        status: string;
        price?: number | string | null;
        formation: { title: string };
    }
}

export function ClientOfferValidation({ session }: ClientOfferValidationProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    if (session.status !== "OFFER_SENT") return null;

    const price = session.price ? Number(session.price) : 0;
    const ttc = (price * 1.21).toFixed(2);

    const handleAccept = async () => {
        if (!confirm(`Confirmer la commande pour un montant de ${price} € HTVA ?`)) return;
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/sessions/${session.id}/accept`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                credentials: "include" // Important for cookies
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message || "Erreur inconnue");
            }

            // Refresh to see new status
            router.refresh();
        } catch (e: any) {
            console.error(e);
            alert("Erreur lors de la validation: " + e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="bg-gradient-to-br from-blue-50 to-blue-100/50 p-8 rounded-[2.5rem] border border-blue-200 shadow-lg shadow-blue-900/5 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/30">
                             <Euro className="h-6 w-6" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-blue-900 tracking-tight leading-none">
                                Offre disponible
                            </h2>
                            <p className="text-sm font-bold text-blue-600 uppercase tracking-widest mt-1">À valider</p>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <p className="text-blue-900/80 font-medium text-lg">
                            Nous vous proposons cette formation au tarif de <span className="font-black text-blue-900 text-xl">{price} € HTVA</span>.
                        </p>
                        <p className="text-sm text-blue-700 font-medium">
                            Soit <span className="font-bold">{ttc} € TTC</span> (TVA 21% incluse).
                        </p>
                    </div>

                    <p className="text-xs text-blue-500/80 font-medium italic max-w-md">
                        En cliquant sur &quot;Accepter l&apos;offre&quot;, vous confirmez votre commande et validez les conditions tarifaires proposées.
                    </p>
                </div>

                <Button
                    onClick={handleAccept}
                    disabled={loading}
                    className="h-16 px-10 rounded-2xl font-black bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-600/20 text-lg whitespace-nowrap transition-all hover:scale-105 active:scale-95"
                >
                    {loading ? <><Loader2 className="mr-3 h-6 w-6 animate-spin" /> Validation...</> : "Accepter l'offre"}
                </Button>
            </div>
        </section>
    );
}
