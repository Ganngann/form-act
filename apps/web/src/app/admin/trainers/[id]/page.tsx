import { API_URL } from '@/lib/config';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Mail, MapPin, ShieldCheck, User, Star, Calendar, BookOpen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { AdminTrainerControls } from '@/components/admin/AdminTrainerControls';
import { Separator } from '@/components/ui/separator';

async function getTrainer(id: string) {
  const cookieStore = cookies();
  const token = cookieStore.get('Authentication')?.value;

  const res = await fetch(`${API_URL}/admin/trainers/${id}`, {
    headers: token ? { Cookie: `Authentication=${token}` } : {},
    cache: 'no-store',
  });
  if (!res.ok) return null;
  return res.json();
}

export default async function TrainerDetailPage({ params }: { params: { id: string } }) {
  const trainer = await getTrainer(params.id);
  if (!trainer) notFound();

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-20 px-4 md:px-8 w-full">
      {/* Header with Breadcrumb */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
          <Link href="/admin" className="hover:text-primary transition-colors">Admin</Link>
          <span>/</span>
          <Link href="/admin/trainers" className="hover:text-primary transition-colors">Formateurs</Link>
          <span>/</span>
          <span className="text-gray-900">Détail</span>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" asChild className="rounded-xl h-10 w-10 border-border bg-white shadow-sm">
              <Link href="/admin/trainers"><ArrowLeft className="h-5 w-5" /></Link>
            </Button>
            <div>
              <h1 className="text-3xl font-black tracking-tight text-gray-900">{trainer.firstName} {trainer.lastName}</h1>
              <div className="flex items-center gap-3 text-muted-foreground font-medium text-sm mt-1">
                <span className="flex items-center gap-1 italic">
                  ID: {trainer.id.slice(0, 8)}
                </span>
                <span>•</span>
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
                  <span className="text-xs font-bold text-green-700">Compte Actif</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content (2 cols) */}
        <div className="lg:col-span-2 space-y-8">

          {/* Key Info Card */}
          <Card className="rounded-[2.5rem] border-transparent shadow-sm bg-white overflow-hidden">
            <CardContent className="p-0 flex flex-col md:flex-row">
              {/* Profile Box */}
              <div className="bg-blue-50/50 min-w-[200px] p-8 flex flex-col items-center justify-center text-center border-r border-blue-100/50">
                <Avatar className="h-24 w-24 border-4 border-white shadow-xl mb-4">
                  <AvatarFallback className="bg-primary text-white text-2xl font-black">
                    {trainer.firstName[0]}{trainer.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <Badge variant="secondary" className="font-black text-[10px] tracking-widest uppercase px-3 py-1 rounded-full bg-white text-primary shadow-sm border-none">
                  Formateur Pro
                </Badge>

                <div className="mt-6 flex items-center justify-center gap-1 text-amber-500">
                  <Star className="h-3.5 w-3.5 fill-current" />
                  <Star className="h-3.5 w-3.5 fill-current" />
                  <Star className="h-3.5 w-3.5 fill-current" />
                  <Star className="h-3.5 w-3.5 fill-current" />
                  <Star className="h-3.5 w-3.5 fill-current" />
                </div>
              </div>

              {/* Details */}
              <div className="flex-1 p-8 space-y-6">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
                    <User className="h-3.5 w-3.5 text-primary" /> État Civil & Contact
                  </h3>
                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Identité</p>
                      <p className="font-bold text-gray-900 text-lg">{trainer.firstName} {trainer.lastName}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Coordonnées</p>
                      <p className="font-bold text-gray-700 flex items-center gap-2">
                        <Mail className="h-4 w-4 text-primary" />
                        {trainer.email}
                      </p>
                    </div>
                  </div>
                </div>

                <Separator className="bg-gray-100" />

                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
                    <ShieldCheck className="h-3.5 w-3.5 text-blue-600" /> Habilitations de base
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="rounded-lg border-blue-100 bg-blue-50 text-blue-700 font-bold px-3 py-1">
                      Formations Qualifiantes
                    </Badge>
                    <Badge variant="outline" className="rounded-lg border-emerald-100 bg-emerald-50 text-emerald-700 font-bold px-3 py-1">
                      Présentiel & Remote
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Modules Habilités */}
          <Card className="rounded-[2.5rem] border-transparent shadow-sm bg-white overflow-hidden">
            <CardHeader className="bg-blue-50/50 border-b border-blue-100/50 p-6">
              <CardTitle className="text-lg font-black flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-600" /> Modules Habilités (Expertise)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="flex flex-wrap gap-3">
                {trainer.authorizedFormations?.length > 0 ? (
                  trainer.authorizedFormations.map((formation: any) => (
                    <Link key={formation.id} href={`/admin/formations/${formation.id}`} className="group/item">
                      <Badge variant="outline" className="rounded-xl border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all font-bold px-4 py-2 flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-500 group-hover/item:scale-125 transition-transform" />
                        {formation.title}
                      </Badge>
                    </Link>
                  ))
                ) : (
                  <div className="w-full text-center py-8 bg-slate-50/50 rounded-[2rem] border border-dashed border-slate-200">
                    <p className="text-xs font-black uppercase tracking-widest text-muted-foreground/60 italic">Aucune habilitation spécifique enregistrée.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Zones d'intervention */}
          <Card className="rounded-[2.5rem] border-transparent shadow-sm bg-white overflow-hidden">
            <CardHeader className="bg-gray-50/50 border-b border-gray-100/50 p-6">
              <CardTitle className="text-lg font-black flex items-center gap-2">
                <MapPin className="h-5 w-5 text-emerald-600" /> Zones d&apos;intervention & Expertise
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Predilection Zones */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary bg-primary/5 px-4 py-2 rounded-full inline-block">
                    Cœur de cible (Prédilection)
                  </h4>
                  <div className="flex flex-wrap gap-2 pr-4">
                    {trainer.predilectionZones?.length > 0 ? (
                      trainer.predilectionZones.map((zone: any) => (
                        <Badge key={zone.id} className="rounded-xl border-none bg-indigo-600 text-white font-black text-[10px] h-10 px-4 shadow-md shadow-indigo-600/20">
                          {zone.code} - {zone.name}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-xs italic text-muted-foreground p-4">Aucune zone de prédilection définie.</p>
                    )}
                  </div>
                </div>

                {/* Expertise Zones */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 bg-blue-50 px-4 py-2 rounded-full inline-block">
                    Zones secondaires (Expertise)
                  </h4>
                  <div className="flex flex-wrap gap-2 pr-4">
                    {trainer.expertiseZones?.length > 0 ? (
                      trainer.expertiseZones.map((zone: any) => (
                        <Badge key={zone.id} className="rounded-xl border-none bg-white text-blue-600 font-black text-[10px] h-10 px-4 shadow-sm border border-blue-100">
                          {zone.code} - {zone.name}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-xs italic text-muted-foreground p-4">Aucune zone d&apos;expertise supplémentaire.</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* placeholder for upcoming sessions or other info */}
        </div>

        {/* Sidebar Controls */}
        <div className="space-y-6">
          <div className="sticky top-6">
            <AdminTrainerControls trainer={trainer} />
          </div>
        </div>
      </div>
    </div>
  )
}
