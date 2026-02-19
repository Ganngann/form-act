"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { HomeHeroConfig } from "@/types/configuration";
import { getSiteConfig, updateSiteConfig } from "@/lib/api-config";
import { Loader2, Save } from "lucide-react";

export function HeroForm() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const { register, handleSubmit, setValue, reset } = useForm<HomeHeroConfig>();

  useEffect(() => {
    async function load() {
      const data = await getSiteConfig<HomeHeroConfig>("home_hero");
      if (data) {
        reset(data);
      }
      setLoading(false);
    }
    load();
  }, [reset]);

  const onSubmit = async (data: HomeHeroConfig) => {
    setSaving(true);
    setSuccess(false);
    const ok = await updateSiteConfig("home_hero", data);
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
          <CardTitle>Section Hero</CardTitle>
          <CardDescription>La première chose que vos visiteurs voient.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tagline">Tagline (Slogan court)</Label>
            <Input id="tagline" {...register("tagline")} />
            <p className="text-[10px] text-muted-foreground">Ex: &quot;The Signature of Expertise&quot;</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Titre Principal (H1)</Label>
            <Input id="title" {...register("title")} />
            <p className="text-[10px] text-muted-foreground">Supporte le HTML pour le formatage (br, span class=&quot;text-primary&quot;).</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="intro">Paragraphe d&apos;intro</Label>
            <Textarea id="intro" {...register("intro")} />
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
