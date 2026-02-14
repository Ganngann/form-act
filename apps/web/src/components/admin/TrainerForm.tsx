'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useRouter } from 'next/navigation';
import { API_URL } from '@/lib/config';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  User,
  Mail,
  MapPin,
  ShieldCheck,
  ChevronRight,
  Save,
  X,
  BadgeCheck,
  AlignLeft,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const formSchema = z.object({
  email: z.string().email('Email invalide'),
  firstName: z.string().min(1, 'Prénom requis'),
  lastName: z.string().min(1, 'Nom requis'),
  bio: z.string().optional(),
  predilectionZones: z.array(z.string()).optional(),
  expertiseZones: z.array(z.string()).optional(),
});

type FormData = z.infer<typeof formSchema>;

interface Zone {
  id: string;
  name: string;
  code: string;
}

interface TrainerFormProps {
  initialData?: any;
  isEdit?: boolean;
}

export function TrainerForm({ initialData, isEdit = false }: TrainerFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [zones, setZones] = useState<Zone[]>([]);
  const [activeTab, setActiveTab] = useState("personal");

  const defaultValues: FormData = {
    email: initialData?.email || '',
    firstName: initialData?.firstName || '',
    lastName: initialData?.lastName || '',
    bio: initialData?.bio || '',
    predilectionZones: initialData?.predilectionZones?.map((z: any) => z.id) || [],
    expertiseZones: initialData?.expertiseZones?.map((z: any) => z.id) || [],
  };

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const predilectionIds = watch('predilectionZones') || [];
  const expertiseIds = watch('expertiseZones') || [];

  useEffect(() => {
    fetch(`${API_URL}/zones`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setZones(data))
      .catch((err) => console.error('Failed to fetch zones', err));
  }, []);

  const handlePredilectionChange = (zoneId: string, checked: boolean) => {
    const current = new Set(predilectionIds);
    if (checked) {
      current.add(zoneId);
      const currentExpertise = new Set(expertiseIds);
      currentExpertise.add(zoneId);
      setValue('expertiseZones', Array.from(currentExpertise));
    } else {
      current.delete(zoneId);
    }
    setValue('predilectionZones', Array.from(current));
  };

  const handleExpertiseChange = (zoneId: string, checked: boolean) => {
    const current = new Set(expertiseIds);
    if (checked) {
      current.add(zoneId);
    } else {
      current.delete(zoneId);
    }
    setValue('expertiseZones', Array.from(current));
  };

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError(null);
    try {
      const url = isEdit
        ? `${API_URL}/admin/trainers/${initialData?.id}`
        : `${API_URL}/admin/trainers`;
      const method = isEdit ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: "include",
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.message || 'Erreur lors de l\'enregistrement');
      }

      router.push(`/admin/trainers/${isEdit ? initialData.id : ''}`);
      router.refresh();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 animate-in fade-in duration-500 w-full">
      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 p-6 rounded-[2rem] text-sm font-bold flex items-center gap-3">
          <ShieldCheck className="h-5 w-5" /> {error}
        </div>
      )}

      <Tabs defaultValue="personal" className="w-full" value={activeTab} onValueChange={setActiveTab}>
        <div className="grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] gap-12 items-start w-full">

          {/* Menu Latéral Fixe */}
          <div className="space-y-6 sticky top-8">
            <Card className="rounded-[2.5rem] border-none shadow-xl bg-white/90 backdrop-blur-md overflow-hidden p-2 border border-white/20">
              <TabsList className="flex flex-col w-full h-auto bg-transparent gap-2 p-1">
                <TabsTrigger value="personal" className="w-full justify-start rounded-2xl px-5 py-4 text-sm font-black data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20 transition-all flex items-center gap-4">
                  <User className="h-4 w-4" /> Profil & Identité
                </TabsTrigger>
                <TabsTrigger value="zones" className="w-full justify-start rounded-2xl px-5 py-4 text-sm font-black data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20 transition-all flex items-center gap-4">
                  <MapPin className="h-4 w-4" /> Zones & Expertise
                </TabsTrigger>
              </TabsList>
            </Card>

            <Card className="rounded-[2.5rem] border-none shadow-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-8">
              <div className="h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center mb-6">
                <BadgeCheck className="h-6 w-6 text-white" />
              </div>
              <h4 className="text-xs font-black uppercase tracking-[0.2em] opacity-60 mb-2">Validation RH</h4>
              <span className="font-black text-xl leading-tight block mb-4 italic">Profil Formateur Certifié</span>
              <p className="text-xs font-medium opacity-70 leading-relaxed">
                Les modifications impactent directement l&apos;annuaire et les possibilités d&apos;affectation.
              </p>
            </Card>
          </div>

          {/* Zone de Contenu Stable */}
          <div className="space-y-8 min-h-[800px] pb-32 w-full">

            {/* Onglet 1: Informations Personnelles */}
            <TabsContent value="personal" className="mt-0 focus-visible:ring-0 space-y-8 animate-in fade-in duration-300 w-full">
              <Card className="rounded-[3rem] border-none shadow-2xl bg-white overflow-hidden">
                <CardHeader className="bg-gray-50/80 border-b border-gray-100 p-10">
                  <CardTitle className="text-2xl font-black flex items-center gap-4 tracking-tight">
                    <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                      <User className="h-6 w-6" />
                    </div>
                    Informations du Profil
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-10 space-y-10">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label htmlFor="firstName" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Prénom</label>
                      <Input id="firstName" {...register('firstName')} placeholder="ex: Jean" className="h-16 rounded-2xl border-gray-100 bg-gray-50/30 focus:bg-white font-bold text-lg transition-all px-6" />
                      {errors.firstName && <p className="text-red-500 text-[10px] font-bold ml-1">{errors.firstName.message}</p>}
                    </div>

                    <div className="space-y-3">
                      <label htmlFor="lastName" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Nom</label>
                      <Input id="lastName" {...register('lastName')} placeholder="ex: Dupont" className="h-16 rounded-2xl border-gray-100 bg-gray-50/30 focus:bg-white font-bold text-lg transition-all px-6" />
                      {errors.lastName && <p className="text-red-500 text-[10px] font-bold ml-1">{errors.lastName.message}</p>}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Email Professionnel</label>
                    <div className="relative">
                      <Mail className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input id="email" type="email" {...register('email')} placeholder="jean.dupont@formact.com" className="pl-14 h-16 rounded-2xl border-gray-100 bg-gray-50/30 focus:bg-white font-bold text-lg transition-all px-6 outline-none" />
                    </div>
                    {errors.email && <p className="text-red-500 text-[10px] font-bold ml-1">{errors.email.message}</p>}
                  </div>

                  <div className="space-y-3">
                    <label htmlFor="bio" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Biographie & Expertise</label>
                    <div className="relative">
                      <AlignLeft className="absolute left-6 top-6 h-5 w-5 text-muted-foreground" />
                      <Textarea
                        id="bio"
                        {...register('bio')}
                        placeholder="Parlez-nous de votre expérience..."
                        className="pl-14 pt-6 min-h-[180px] rounded-[2rem] border-gray-100 bg-gray-50/30 focus:bg-white font-medium text-base transition-all px-6 resize-none leading-relaxed"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Onglet 2: Zones d'Intervention */}
            <TabsContent value="zones" className="mt-0 focus-visible:ring-0 space-y-8 animate-in fade-in duration-300 w-full">

              {/* Aide Déplacée ici - Là où on en a besoin */}
              <Card className="rounded-[2.5rem] border-none shadow-xl bg-blue-50/50 overflow-hidden border border-blue-100/50">
                <CardHeader className="bg-blue-100/30 border-b border-blue-100/30 p-8">
                  <CardTitle className="text-lg font-black flex items-center gap-3 tracking-tight text-blue-900">
                    <Info className="h-5 w-5 text-blue-600" /> Aide à la configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="p-6 bg-white rounded-3xl shadow-sm border border-blue-100/50 text-blue-800 space-y-3">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-400">Rappel des Niveaux</h4>
                      <p className="text-xs font-semibold leading-relaxed">
                        La <span className="text-primary font-black uppercase tracking-tighter">Prédilection</span> indique une priorité absolue d&apos;affectation (localité proche).
                      </p>
                      <p className="text-xs font-semibold leading-relaxed">
                        L&apos;<span className="text-blue-600 font-black uppercase tracking-tighter">Expertise</span> autorise le formateur à intervenir en renfort ou sur mission ponctuelle.
                      </p>
                    </div>

                    <div className="p-6 bg-amber-50 rounded-3xl border border-amber-100 text-xs text-amber-900 font-bold flex items-center gap-4 leading-tight">
                      <div className="h-10 w-10 shrink-0 rounded-full bg-amber-200 flex items-center justify-center">
                        <ShieldCheck className="h-5 w-5 text-amber-700" />
                      </div>
                      <p>Une zone en Prédilection est automatiquement ajoutée en Expertise pour garantir la cohérence des droits.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Liste des Zones */}
              <Card className="rounded-[3rem] border-none shadow-2xl bg-white overflow-hidden">
                <CardHeader className="bg-gray-50/80 border-b border-gray-100 p-8 md:p-10">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl font-black flex items-center gap-4 tracking-tight">
                      <div className="h-12 w-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-inner">
                        <MapPin className="h-6 w-6" />
                      </div>
                      Province & Localités
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 divide-x divide-gray-100 border-b border-gray-100">
                    {/* Header Desktop */}
                    <div className="hidden md:flex items-center justify-between px-8 md:px-10 py-4 bg-slate-50 border-b border-gray-100 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
                      <span>Région</span>
                      <div className="flex gap-12 pr-6">
                        <span className="w-8 text-center text-primary">Pred.</span>
                        <span className="w-8 text-center text-blue-600">Exp.</span>
                      </div>
                    </div>
                    <div className="hidden md:flex items-center justify-between px-8 md:px-10 py-4 bg-slate-50 border-b border-gray-100 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
                      <span>Région</span>
                      <div className="flex gap-12 pr-6">
                        <span className="w-8 text-center text-primary">Pred.</span>
                        <span className="w-8 text-center text-blue-600">Exp.</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 divide-x divide-gray-100">
                    {zones.map((zone, index) => {
                      const isPredilection = predilectionIds.includes(zone.id);
                      const isExpertise = expertiseIds.includes(zone.id);

                      return (
                        <div key={zone.id} className={cn(
                          "flex items-center justify-between p-6 md:p-8 hover:bg-slate-50 transition-all group border-b border-gray-50",
                        )}>
                          <div className="flex items-center gap-6">
                            <div className={cn(
                              "h-12 w-12 rounded-2xl flex items-center justify-center font-black text-xs transition-all shadow-sm",
                              isPredilection ? "bg-primary text-white scale-110 shadow-primary/30" : isExpertise ? "bg-blue-600 text-white scale-105" : "bg-gray-100 text-gray-400 group-hover:bg-gray-200"
                            )}>
                              {zone.code}
                            </div>
                            <div>
                              <p className="font-black text-gray-900 text-lg uppercase tracking-tight">{zone.name}</p>
                              <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-60">BELGIQUE</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-10 pr-4">
                            <div className="flex flex-col items-center gap-2">
                              <span className="text-[8px] font-black uppercase tracking-tighter text-muted-foreground opacity-50 md:hidden">Préd.</span>
                              <input
                                type="checkbox"
                                checked={isPredilection}
                                onChange={(e) => handlePredilectionChange(zone.id, e.target.checked)}
                                className="h-7 w-7 rounded-xl border-2 border-slate-200 text-primary focus:ring-primary focus:ring-offset-0 transition-all cursor-pointer checked:border-primary shadow-sm"
                              />
                            </div>
                            <div className="flex flex-col items-center gap-2">
                              <span className="text-[8px] font-black uppercase tracking-tighter text-muted-foreground opacity-50 md:hidden">Exp.</span>
                              <input
                                type="checkbox"
                                checked={isExpertise || isPredilection}
                                disabled={isPredilection}
                                onChange={(e) => handleExpertiseChange(zone.id, e.target.checked)}
                                className="h-7 w-7 rounded-xl border-2 border-slate-200 text-blue-600 focus:ring-blue-600 focus:ring-offset-0 transition-all cursor-pointer disabled:opacity-20 disabled:cursor-not-allowed checked:border-blue-600 shadow-sm"
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </div>
      </Tabs>

      {/* Barre d'Actions Flottante Stable */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[calc(100%-4rem)] max-w-5xl z-50">
        <div className="p-6 bg-white/80 border border-white/40 backdrop-blur-xl rounded-[2.5rem] shadow-2xl flex justify-between items-center px-10 border-t">
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.back()}
            className="rounded-2xl font-black text-xs uppercase tracking-widest h-14 px-8 text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all"
          >
            <X className="mr-3 h-5 w-5" /> Annuler
          </Button>

          <div className="flex items-center gap-6">
            {activeTab === "personal" && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setActiveTab("zones")}
                className="rounded-2xl font-black text-xs uppercase tracking-widest h-14 px-8 border-slate-200 hover:bg-slate-50"
              >
                Suivant : Zones <ChevronRight className="ml-3 h-5 w-5" />
              </Button>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="rounded-2xl font-black text-xs uppercase tracking-[0.2em] h-14 px-12 shadow-2xl shadow-primary/30 hover:shadow-primary/40 transition-all bg-primary hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? (
                <div className="flex items-center gap-3">
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Synchronisation...
                </div>
              ) : (
                <>
                  <Save className="mr-3 h-5 w-5" />
                  {isEdit ? 'Mettre à jour le profil' : 'Créer le formateur'}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
