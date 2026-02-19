"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GlobalForm } from "@/components/admin/content/GlobalForm";
import { HeroForm } from "@/components/admin/content/HeroForm";
import { PromoForm } from "@/components/admin/content/PromoForm";
import { ValuesForm } from "@/components/admin/content/ValuesForm";
import { TrustForm } from "@/components/admin/content/TrustForm";
import { CtaForm } from "@/components/admin/content/CtaForm";

export default function ContentPage() {
  return (
    <div className="flex flex-col gap-8 w-full max-w-4xl">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black tracking-tight">Gestion du Contenu</h1>
        <p className="text-muted-foreground font-medium">
          Personnalisez les textes et configurations de la page d'accueil et du site.
        </p>
      </div>

      <Tabs defaultValue="global" className="w-full">
        <TabsList className="w-full justify-start h-auto p-1 bg-muted/50 rounded-xl mb-6 overflow-x-auto">
          <TabsTrigger value="global" className="rounded-lg py-2.5 px-4 font-bold">Global</TabsTrigger>
          <TabsTrigger value="hero" className="rounded-lg py-2.5 px-4 font-bold">Hero (Intro)</TabsTrigger>
          <TabsTrigger value="promo" className="rounded-lg py-2.5 px-4 font-bold">Promo (Grid)</TabsTrigger>
          <TabsTrigger value="values" className="rounded-lg py-2.5 px-4 font-bold">Arguments</TabsTrigger>
          <TabsTrigger value="trust" className="rounded-lg py-2.5 px-4 font-bold">Preuve Sociale</TabsTrigger>
          <TabsTrigger value="cta" className="rounded-lg py-2.5 px-4 font-bold">Appel à l'action</TabsTrigger>
        </TabsList>

        <TabsContent value="global" className="focus-visible:ring-0">
          <GlobalForm />
        </TabsContent>
        <TabsContent value="hero" className="focus-visible:ring-0">
          <HeroForm />
        </TabsContent>
        <TabsContent value="promo" className="focus-visible:ring-0">
          <PromoForm />
        </TabsContent>
        <TabsContent value="values" className="focus-visible:ring-0">
          <ValuesForm />
        </TabsContent>
        <TabsContent value="trust" className="focus-visible:ring-0">
          <TrustForm />
        </TabsContent>
        <TabsContent value="cta" className="focus-visible:ring-0">
          <CtaForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}
