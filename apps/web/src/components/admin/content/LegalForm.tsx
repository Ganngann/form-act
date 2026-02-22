"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LegalTextsConfig } from "@/types/configuration";
import { getSiteConfig, updateSiteConfig } from "@/lib/api-config";
import { Loader2, Save } from "lucide-react";

export function LegalForm() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const { register, handleSubmit, reset } = useForm<LegalTextsConfig>();

  useEffect(() => {
    async function load() {
      const data = await getSiteConfig<LegalTextsConfig>("legal_texts");
      if (data) {
        reset(data);
      }
      setLoading(false);
    }
    load();
  }, [reset]);

  const onSubmit = async (data: LegalTextsConfig) => {
    setSaving(true);
    setSuccess(false);
    const ok = await updateSiteConfig("legal_texts", data);
    if (ok) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }
    setSaving(false);
  };

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 w-full max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Textes Légaux</CardTitle>
          <CardDescription>
            Éditez le contenu des pages légales. Vous pouvez utiliser du HTML simple (ex: &lt;p&gt;, &lt;ul&gt;, &lt;b&gt;).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="mentions" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="mentions">Mentions Légales</TabsTrigger>
              <TabsTrigger value="cgv">CGV</TabsTrigger>
              <TabsTrigger value="privacy">Confidentialité</TabsTrigger>
            </TabsList>

            <TabsContent value="mentions" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="mentions">Contenu des Mentions Légales</Label>
                <Textarea
                  id="mentions"
                  {...register("mentions")}
                  className="min-h-[400px] font-mono text-sm"
                  placeholder="<p>Votre contenu ici...</p>"
                />
              </div>
            </TabsContent>

            <TabsContent value="cgv" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cgv">Contenu des Conditions Générales de Vente</Label>
                <Textarea
                  id="cgv"
                  {...register("cgv")}
                  className="min-h-[400px] font-mono text-sm"
                  placeholder="<p>Article 1...</p>"
                />
              </div>
            </TabsContent>

            <TabsContent value="privacy" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="privacy">Contenu de la Politique de Confidentialité</Label>
                <Textarea
                  id="privacy"
                  {...register("privacy")}
                  className="min-h-[400px] font-mono text-sm"
                  placeholder="<p>Nous collectons...</p>"
                />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <div className="flex items-center gap-4">
        <Button type="submit" disabled={saving}>
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          <Save className="mr-2 h-4 w-4" /> Enregistrer les modifications
        </Button>
        {success && <span className="text-green-600 font-bold text-sm animate-in fade-in">Sauvegardé !</span>}
      </div>
    </form>
  );
}
