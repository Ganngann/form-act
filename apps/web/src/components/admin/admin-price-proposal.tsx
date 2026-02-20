"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { API_URL } from "@/lib/config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Euro, Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";

export function AdminPriceProposal({ session }: { session: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [price, setPrice] = useState<number>(session.price ? Number(session.price) : (session.formation.price ? Number(session.formation.price) : 0));

  if (session.status !== "PENDING_APPROVAL") return null;

  const handleSendOffer = async () => {
    if (!confirm("Envoyer cette proposition tarifaire au client ?")) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/sessions/${session.id}/offer`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ price }),
        credentials: "include"
      });
      if (!res.ok) throw new Error("Erreur lors de l'envoi");
      router.refresh();
    } catch (e) {
      alert("Impossible d'envoyer l'offre");
    } finally {
      setLoading(false);
    }
  };

  const ttc = (Number(price) * 1.21).toFixed(2);

  return (
    <Card className="rounded-[2.5rem] border-none shadow-xl bg-white overflow-hidden mb-6">
      <CardHeader className="bg-amber-50/50 border-b border-amber-100/50 pb-4">
        <CardTitle className="text-lg font-black text-amber-900 tracking-tight flex items-center gap-2">
          <Euro className="h-5 w-5 text-amber-600" /> Proposition Tarifaire
        </CardTitle>
      </CardHeader>
      <CardContent className="p-8 pt-6 space-y-6">
        <div className="bg-amber-50/30 p-6 rounded-2xl border border-amber-100/50 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="price" className="text-xs font-black uppercase text-amber-800 ml-1">Prix proposé (HTVA)</Label>
            <div className="relative">
               <Input
                  id="price"
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="bg-white border-amber-200 focus-visible:ring-amber-500 rounded-xl h-14 font-black text-xl pr-10 tracking-tight"
               />
               <div className="absolute right-4 top-4 text-amber-400 font-bold">€</div>
            </div>
            <p className="text-xs text-amber-700 font-medium text-right flex justify-end gap-1">
              Soit <span className="font-bold bg-amber-100 px-1 rounded text-amber-800">{ttc} € TTC</span> (21%)
            </p>
          </div>
        </div>

        <Button
          onClick={handleSendOffer}
          disabled={loading}
          className="w-full h-14 rounded-xl font-black bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-amber-600/20 text-lg"
        >
          {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Envoyer l'offre au client"}
        </Button>
      </CardContent>
    </Card>
  );
}
