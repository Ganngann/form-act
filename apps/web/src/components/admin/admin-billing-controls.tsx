"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { API_URL } from "@/lib/config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
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
  const existingBilling = session.billedAt && session.billingData ? JSON.parse(session.billingData) : null;

  useEffect(() => {
    if (!session.billedAt && session.proofUrl) {
      // Fetch preview
      fetch(`${API_URL}/sessions/${session.id}/billing-preview`, { credentials: 'include' })
        .then(res => res.json())
        .then(data => {
            setPreview(data);
            setDistanceFee(data.distanceFee || 0);
        })
        .catch(err => console.error("Failed to fetch billing preview", err));
    }
  }, [session.id, session.billedAt, session.proofUrl]);

  const handleBill = async () => {
    if (!preview) return;
    if (!confirm("Confirmer la facturation ? Cette action est irréversible.")) return;

    setLoading(true);
    const finalPrice = preview.basePrice + preview.optionsFee + Number(distanceFee) + Number(adjustment);

    const billingPayload = {
        basePrice: preview.basePrice,
        optionsFee: preview.optionsFee,
        optionsDetails: preview.optionsDetails,
        distanceFee: Number(distanceFee),
        adminAdjustment: Number(adjustment),
        finalPrice
    };

    try {
      const res = await fetch(`${API_URL}/sessions/${session.id}/bill`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(billingPayload),
        credentials: "include"
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
      return null;
      // Or return a placeholder: <p className="text-sm text-muted-foreground italic">En attente de preuve pour facturation...</p>
  }

  // 2. Already Billed (Read Only)
  if (session.billedAt && existingBilling) {
      return (
          <Card className="border-green-200 bg-green-50/50">
              <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-800">
                      <CheckCircle className="h-5 w-5" />
                      Session Facturée
                  </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                  <div className="grid grid-cols-2 gap-2">
                      <span className="text-muted-foreground">Date validation:</span>
                      <span className="font-medium">{new Date(session.billedAt).toLocaleDateString()}</span>

                      <span className="text-muted-foreground">Prix Base:</span>
                      <span>{existingBilling.basePrice} €</span>

                      <span className="text-muted-foreground">Options:</span>
                      <span>{existingBilling.optionsFee} €</span>

                      <span className="text-muted-foreground">Déplacement:</span>
                      <span>{existingBilling.distanceFee} €</span>

                      <span className="text-muted-foreground">Ajustement:</span>
                      <span>{existingBilling.adminAdjustment} €</span>

                      <div className="col-span-2 border-t my-2"></div>

                      <span className="font-bold text-lg">Total HTVA:</span>
                      <span className="font-bold text-lg text-green-700">{existingBilling.finalPrice} €</span>
                  </div>
              </CardContent>
          </Card>
      );
  }

  // 3. Billing Preparation Form
  if (!preview) return <div className="p-4 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></div>;

  const currentTotal = preview.basePrice + preview.optionsFee + Number(distanceFee) + Number(adjustment);

  return (
      <Card className="border-amber-200 bg-amber-50/30">
          <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-800">
                  <FileText className="h-5 w-5" />
                  Préparation Facturation (Odoo)
              </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
              {/* Base Info */}
              <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="text-muted-foreground">Prix Catalogue:</span>
                  <span className="font-medium">{preview.basePrice} €</span>

                  <span className="text-muted-foreground">Options ({preview.optionsDetails.length}):</span>
                  <span className="font-medium">{preview.optionsFee} €</span>
                  {preview.optionsDetails.length > 0 && (
                      <div className="col-span-2 text-xs text-muted-foreground pl-4">
                          {preview.optionsDetails.join(", ")}
                      </div>
                  )}
              </div>

              {/* Editables */}
              <div className="space-y-3 pt-2 border-t">
                  <div className="space-y-1">
                      <Label htmlFor="distance">Frais Déplacement (€)</Label>
                      <Input
                          id="distance"
                          type="number"
                          value={distanceFee}
                          onChange={(e) => setDistanceFee(Number(e.target.value))}
                          className="bg-white"
                      />
                  </div>
                  <div className="space-y-1">
                      <Label htmlFor="adjustment">Ajustement Admin (+/- €)</Label>
                      <Input
                          id="adjustment"
                          type="number"
                          value={adjustment}
                          onChange={(e) => setAdjustment(Number(e.target.value))}
                          className="bg-white"
                          placeholder="Ex: -50 pour remise"
                      />
                  </div>
              </div>

              {/* Total */}
              <div className="flex justify-between items-center pt-4 border-t">
                  <span className="font-bold text-lg">Total à Facturer</span>
                  <span className="font-bold text-xl text-amber-700">{currentTotal} €</span>
              </div>
          </CardContent>
          <CardFooter>
              <Button onClick={handleBill} disabled={loading} className="w-full bg-amber-600 hover:bg-amber-700">
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Valider & Marquer Facturé
              </Button>
          </CardFooter>
      </Card>
  );
}
