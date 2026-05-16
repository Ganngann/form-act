"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { HomeBentoConfig } from "@/types/configuration";
import { getSiteConfig, updateSiteConfig } from "@/lib/api-config";
import { Loader2, Save } from "lucide-react";

export function BentoForm() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const { register, handleSubmit, reset } = useForm<HomeBentoConfig>();

  useEffect(() => {
    async function load() {
      const data = await getSiteConfig<HomeBentoConfig>("home_bento");
      if (data) {
        reset(data);
      }
      setLoading(false);
    }
    load();
  }, [reset]);

  const onSubmit = async (data: HomeBentoConfig) => {
    setSaving(true);
    setSuccess(false);
    const ok = await updateSiteConfig("home_bento", data);
    if (ok) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }
    setSaving(false);
  };

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Grille Bento</CardTitle>
          <CardDescription>Personnalisez les textes de la section aperçu et statistiques.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">

          <div className="space-y-4 border-b pb-4">
            <h4 className="font-bold">Aperçu Espace Client (Utilisateur connecté)</h4>
            <div className="space-y-2">
              <Label htmlFor="userPreviewBadge">Badge</Label>
              <Input id="userPreviewBadge" {...register("userPreviewBadge")} placeholder="Aperçu de votre espace" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="userPreviewTitle">Titre (Supporte HTML)</Label>
              <Input id="userPreviewTitle" {...register("userPreviewTitle")} placeholder="Digital Strategy & <br />Product Management" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="userPreviewDesc">Description</Label>
              <Textarea id="userPreviewDesc" {...register("userPreviewDesc")} placeholder="Programmé pour le mois prochain..." />
            </div>
          </div>

          <div className="space-y-4 border-b pb-4">
            <h4 className="font-bold">Encart Action</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="userActionTitle">Titre (Connecté)</Label>
                <Input id="userActionTitle" {...register("userActionTitle")} placeholder="Dossier incomplet" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="visitorActionTitle">Titre (Visiteur)</Label>
                <Input id="visitorActionTitle" {...register("visitorActionTitle")} placeholder="Demande de Devis" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="userActionDesc">Description (Connecté)</Label>
                <Textarea id="userActionDesc" {...register("userActionDesc")} placeholder="Veuillez envoyer la liste..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="visitorActionDesc">Description (Visiteur)</Label>
                <Textarea id="visitorActionDesc" {...register("visitorActionDesc")} placeholder="Recevez une proposition personnalisée..." />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-bold">Statistiques</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="stat1Value">Stat 1 : Valeur</Label>
                <Input id="stat1Value" {...register("stat1Value")} placeholder="542" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stat1Label">Stat 1 : Libellé</Label>
                <Input id="stat1Label" {...register("stat1Label")} placeholder="Experts Certifiés" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="stat2Value">Stat 2 : Valeur</Label>
                <Input id="stat2Value" {...register("stat2Value")} placeholder="98%" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stat2Label">Stat 2 : Libellé</Label>
                <Input id="stat2Label" {...register("stat2Label")} placeholder="Satisfaction" />
              </div>
            </div>
          </div>

        </CardContent>
      </Card>

      <div className="flex items-center gap-4">
        <Button type="submit" disabled={saving}>
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          <Save className="mr-2 h-4 w-4" /> Enregistrer
        </Button>
        {success && <span className="text-green-600 font-bold text-sm animate-in fade-in">Sauvegardé !</span>}
      </div>
    </form>
  );
}
