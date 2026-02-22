"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminHeader } from '@/components/admin/AdminHeader';
import { GlobalForm } from "@/components/admin/content/GlobalForm";
import { HeroForm } from "@/components/admin/content/HeroForm";
import { PromoForm } from "@/components/admin/content/PromoForm";
import { ValuesForm } from "@/components/admin/content/ValuesForm";
import { TrustForm } from "@/components/admin/content/TrustForm";
import { CtaForm } from "@/components/admin/content/CtaForm";
import { LegalForm } from "@/components/admin/content/LegalForm";

export default function ContentPage() {
  return (
    <div className="flex flex-col gap-8 w-full max-w-4xl">
      <AdminHeader
        badge="CMS"
        badgeClassName="bg-purple-50 border-purple-200 text-purple-600"
        title="Gestion du Contenu"
        description="Personnalisez les textes et configurations de la page d'accueil et du site."
      />

      <Tabs defaultValue="global" className="w-full">
        <TabsList className="w-full justify-start h-auto p-1 bg-muted/50 rounded-xl mb-6 overflow-x-auto">
          <TabsTrigger value="global" className="rounded-lg py-2.5 px-4 font-bold">Global</TabsTrigger>
          <TabsTrigger value="hero" className="rounded-lg py-2.5 px-4 font-bold">Hero (Intro)</TabsTrigger>
          <TabsTrigger value="promo" className="rounded-lg py-2.5 px-4 font-bold">Promo (Grid)</TabsTrigger>
          <TabsTrigger value="values" className="rounded-lg py-2.5 px-4 font-bold">Arguments</TabsTrigger>
          <TabsTrigger value="trust" className="rounded-lg py-2.5 px-4 font-bold">Preuve Sociale</TabsTrigger>
          <TabsTrigger value="cta" className="rounded-lg py-2.5 px-4 font-bold">Appel à l&apos;action</TabsTrigger>
          <TabsTrigger value="legal" className="rounded-lg py-2.5 px-4 font-bold">Légal</TabsTrigger>
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
        <TabsContent value="legal" className="focus-visible:ring-0">
          <LegalForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}
