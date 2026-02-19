"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { HomePromoConfig } from "@/types/configuration";
import { getSiteConfig, updateSiteConfig } from "@/lib/api-config";
import { Loader2, Save } from "lucide-react";

export function PromoForm() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const { register, handleSubmit, setValue, reset } = useForm<HomePromoConfig>();

  useEffect(() => {
    async function load() {
      const data = await getSiteConfig<HomePromoConfig>("home_promo");
      if (data) {
        reset(data);
      }
      setLoading(false);
    }
    load();
  }, [reset]);

  const onSubmit = async (data: HomePromoConfig) => {
    setSaving(true);
    setSuccess(false);
    const ok = await updateSiteConfig("home_promo", data);
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
          <CardTitle>Bento Grid (Bloc Promo)</CardTitle>
          <CardDescription>Le bloc bleu/violet qui invite les visiteurs à s&apos;inscrire.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="subtitle">Sous-titre (Petit label)</Label>
            <Input id="subtitle" {...register("subtitle")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Titre</Label>
            <Input id="title" {...register("title")} />
            <p className="text-[10px] text-muted-foreground">Supporte &lt;br /&gt;</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Texte descriptif</Label>
            <Textarea id="description" {...register("description")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="buttonLabel">Libellé du Bouton</Label>
            <Input id="buttonLabel" {...register("buttonLabel")} />
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
