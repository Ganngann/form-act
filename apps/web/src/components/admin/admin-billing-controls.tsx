"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { API_URL } from "@/lib/config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle, FileText } from "lucide-react";

interface BillingData {
  basePrice: number;
  distanceFee: number;
  optionsFee: number;
  optionsDetails: string[];
  adminAdjustment?: number;
  finalPrice?: number;
  total?: number; // from preview
}

export function AdminBillingControls({ session }: { session: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<BillingData | null>(null);
  const [distanceFee, setDistanceFee] = useState(0);
  const [adjustment, setAdjustment] = useState(0);

  // Parse existing billing data if billed
  const existingBilling =
    session.billedAt && session.billingData
      ? JSON.parse(session.billingData)
      : null;

  useEffect(() => {
    if (!session.billedAt && session.proofUrl) {
      // Fetch preview
      fetch(`${API_URL}/sessions/${session.id}/billing-preview`, {
        credentials: "include",
      })
        .then((res) => res.json())
        .then((data) => {
          setPreview(data);
          setDistanceFee(data.distanceFee || 0);
        })
        .catch((err) => console.error("Failed to fetch billing preview", err));
    }
  }, [session.id, session.billedAt, session.proofUrl]);

  const handleBill = async () => {
    if (!preview) return;
    if (!confirm("Confirmer la facturation ? Cette action est irréversible."))
      return;

    setLoading(true);
    const finalPrice =
      preview.basePrice +
      preview.optionsFee +
      Number(distanceFee) +
      Number(adjustment);

    const billingPayload = {
      basePrice: preview.basePrice,
      optionsFee: preview.optionsFee,
      optionsDetails: preview.optionsDetails,
      distanceFee: Number(distanceFee),
      adminAdjustment: Number(adjustment),
      finalPrice,
    };

    try {
      const res = await fetch(`${API_URL}/sessions/${session.id}/bill`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(billingPayload),
        credentials: "include",
      });

      if (!res.ok) throw new Error("Billing failed");
      router.refresh();
    } catch (e) {
      alert("Erreur lors de la facturation");
    } finally {
      setLoading(false);
    }
  };

  // 1. Session not ready (No proof)
  if (!session.proofUrl && !session.billedAt) {
    return (
      <Card className="border-dashed border-gray-300 bg-gray-50/50 rounded-[2rem] overflow-hidden shadow-sm opacity-70">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-gray-500 font-bold text-base">
            <FileText className="h-5 w-5" />
            Facturation Indisponible
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-white p-4 rounded-xl border border-gray-100 text-sm text-center space-y-2">
            <p className="font-medium text-gray-700">
              En attente de preuve de prestation
            </p>
            <p className="text-xs text-muted-foreground">
              Le formateur doit télécharger la feuille de présence ou la preuve
              de prestation pour débloquer la facturation.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // 2. Already Billed (Read Only)
  if (session.billedAt && existingBilling) {
    return (
      <Card className="border-green-200 bg-green-50/50 rounded-[2rem] overflow-hidden shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800 font-black">
            <CheckCircle className="h-5 w-5" />
            Session Facturée
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm pb-6">
          <div className="bg-white/60 p-4 rounded-xl space-y-3 border border-green-100/50">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground font-medium">
                Date validation
              </span>
              <span className="font-bold text-gray-900">
                {new Date(session.billedAt).toLocaleDateString()}
              </span>
            </div>
            <div className="h-px bg-green-200/50"></div>
            <div className="grid grid-cols-2 gap-y-2">
              <span className="text-muted-foreground">Prix Base:</span>
              <span className="text-right font-medium">
                {existingBilling.basePrice} €
              </span>

              <span className="text-muted-foreground">Options:</span>
              <span className="text-right font-medium">
                {existingBilling.optionsFee} €
              </span>

              <span className="text-muted-foreground">Déplacement:</span>
              <span className="text-right font-medium">
                {existingBilling.distanceFee} €
              </span>

              <span className="text-muted-foreground">Ajustement:</span>
              <span className="text-right font-medium">
                {existingBilling.adminAdjustment} €
              </span>
            </div>
            <div className="h-px bg-green-200/50"></div>
            <div className="flex justify-between items-center pt-1">
              <span className="font-black text-lg text-green-900">
                Total HTVA
              </span>
              <span className="font-black text-lg text-green-700">
                {existingBilling.finalPrice} €
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // 3. Billing Preparation Form
  if (!preview)
    return (
      <div className="p-8 text-center bg-white rounded-[2rem] shadow-sm">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-amber-500 mb-2" />
        <p className="font-bold text-amber-700">Calcul en cours...</p>
      </div>
    );

  const currentTotal =
    preview.basePrice +
    preview.optionsFee +
    Number(distanceFee) +
    Number(adjustment);

  return (
    <Card className="border-amber-200 bg-amber-50/30 rounded-[2rem] overflow-hidden shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-amber-800 font-black">
          <FileText className="h-5 w-5" />
          Facturation (Odoo)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5 pb-6">
        {/* Client Billing Info */}
        <div className="bg-white p-4 rounded-xl border border-amber-100 shadow-sm space-y-2">
          <p className="text-xs font-black uppercase tracking-widest text-amber-600 mb-2">
            Client à facturer
          </p>
          <div className="space-y-1">
            <p className="font-bold text-gray-900">
              {session.client?.companyName}
            </p>
            <div className="text-xs text-muted-foreground font-medium grid grid-cols-[auto,1fr] gap-x-2">
              <span>TVA:</span>{" "}
              <span className="text-gray-700">
                {session.client?.vatNumber || "Non renseigné"}
              </span>
              <span>Adr:</span>{" "}
              <span className="truncate text-gray-700">
                {session.client?.address || "Adresse inconnue"}
              </span>
            </div>
          </div>
        </div>

        {/* Pricing Breakdown */}
        <div className="space-y-3">
          <div className="flex justify-between items-center px-2">
            <span className="text-sm font-medium text-muted-foreground">
              Prix Catalogue
            </span>
            <span className="font-bold text-gray-900">
              {preview.basePrice} €
            </span>
          </div>
          <div className="flex justify-between items-center px-2">
            <span className="text-sm font-medium text-muted-foreground">
              Options ({preview.optionsDetails.length})
            </span>
            <span className="font-bold text-gray-900">
              {preview.optionsFee} €
            </span>
          </div>
          {preview.optionsDetails.length > 0 && (
            <div className="bg-amber-100/50 p-2 rounded-lg text-xs text-amber-800 font-medium ml-2">
              {preview.optionsDetails.join(", ")}
            </div>
          )}
        </div>

        {/* Editables */}
        <div className="space-y-4 pt-4 border-t border-amber-200/50">
          <div className="space-y-1.5">
            <Label
              htmlFor="distance"
              className="text-xs font-black uppercase text-amber-800 ml-1"
            >
              Frais Déplacement (€)
            </Label>
            <Input
              id="distance"
              type="number"
              value={distanceFee}
              onChange={(e) => setDistanceFee(Number(e.target.value))}
              className="bg-white border-amber-200 focus-visible:ring-amber-500 rounded-xl h-11 font-bold"
            />
          </div>
          <div className="space-y-1.5">
            <Label
              htmlFor="adjustment"
              className="text-xs font-black uppercase text-amber-800 ml-1"
            >
              Ajustement Admin (+/- €)
            </Label>
            <Input
              id="adjustment"
              type="number"
              value={adjustment}
              onChange={(e) => setAdjustment(Number(e.target.value))}
              className="bg-white border-amber-200 focus-visible:ring-amber-500 rounded-xl h-11 font-bold placeholder:font-normal"
              placeholder="Ex: -50 pour remise"
            />
          </div>
        </div>

        {/* Total */}
        <div className="flex justify-between items-center pt-4 border-t border-amber-200">
          <span className="font-black text-lg text-gray-900">
            Total à Facturer
          </span>
          <span className="font-black text-2xl text-amber-600">
            {currentTotal} €
          </span>
        </div>
      </CardContent>
      <CardFooter className="pb-6 px-6">
        <Button
          onClick={handleBill}
          disabled={loading}
          className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold h-12 rounded-xl shadow-md hover:shadow-lg transition-all"
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Valider & Envoyer
        </Button>
      </CardFooter>
    </Card>
  );
}
