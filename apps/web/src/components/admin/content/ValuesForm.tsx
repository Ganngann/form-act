"use client";

import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { HomeValueConfig } from "@/types/configuration";
import { getSiteConfig, updateSiteConfig } from "@/lib/api-config";
import { Loader2, Save } from "lucide-react";

interface FormValues {
  items: HomeValueConfig[];
}

export function ValuesForm() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const { register, control, handleSubmit, reset } = useForm<FormValues>({
    defaultValues: {
      items: [
        { title: "", text: "" },
        { title: "", text: "" },
        { title: "", text: "" }
      ]
    }
  });

  const { fields } = useFieldArray({
    control,
    name: "items"
  });

  useEffect(() => {
    async function load() {
      const data = await getSiteConfig<HomeValueConfig[]>("home_values");
      if (data && Array.isArray(data)) {
        reset({ items: data });
      }
      setLoading(false);
    }
    load();
  }, [reset]);

  const onSubmit = async (data: FormValues) => {
    setSaving(true);
    setSuccess(false);
    const ok = await updateSiteConfig("home_values", data.items);
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
          <CardTitle>Arguments (Piliers)</CardTitle>
          <CardDescription>Les 3 points forts affichés sous le catalogue.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {fields.map((field, index) => (
            <div key={field.id} className="p-4 border rounded-lg bg-muted/20">
              <h4 className="font-bold mb-4">Argument {index + 1}</h4>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Titre</Label>
                  <Input {...register(`items.${index}.title` as const)} />
                  <p className="text-[10px] text-muted-foreground">Supporte &lt;br /&gt;</p>
                </div>
                <div className="space-y-2">
                  <Label>Texte</Label>
                  <Textarea {...register(`items.${index}.text` as const)} />
                </div>
              </div>
            </div>
          ))}
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
