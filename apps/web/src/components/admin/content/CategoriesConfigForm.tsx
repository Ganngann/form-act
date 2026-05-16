"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { HomeCategoriesConfig } from "@/types/configuration";
import { getSiteConfig, updateSiteConfig } from "@/lib/api-config";
import { Loader2, Save } from "lucide-react";

export function CategoriesConfigForm() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const { register, handleSubmit, reset } = useForm<HomeCategoriesConfig>();

  useEffect(() => {
    async function load() {
      const data = await getSiteConfig<HomeCategoriesConfig>("home_categories");
      if (data) {
        reset(data);
      }
      setLoading(false);
    }
    load();
  }, [reset]);

  const onSubmit = async (data: HomeCategoriesConfig) => {
    setSaving(true);
    setSuccess(false);
    const ok = await updateSiteConfig("home_categories", data);
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
          <CardTitle>Section Catégories</CardTitle>
          <CardDescription>Personnalisez les textes de la section affichant les thématiques de formation.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="badge">Badge</Label>
            <Input id="badge" {...register("badge")} placeholder="Explorez le savoir" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Titre (Supporte HTML)</Label>
            <Input id="title" {...register("title")} placeholder="Toutes nos <br /><span class='text-primary italic'>Thématiques.</span>" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="link">Texte du Lien</Label>
            <Input id="link" {...register("link")} placeholder="Voir tout le catalogue" />
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
