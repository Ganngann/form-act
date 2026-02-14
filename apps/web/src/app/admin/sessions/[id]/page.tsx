import { API_URL } from '@/lib/config';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { AdminSessionControls } from '@/components/admin/admin-session-controls';
import { AdminBillingControls } from '@/components/admin/admin-billing-controls';
import { StatusBadge } from '@/components/ui/status-badge';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MapPin, Calendar, Clock, User, Users, Package, Building2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { LogisticsSummary } from '@/components/admin/LogisticsSummary';
import { ParticipantsSummary } from '@/components/admin/ParticipantsSummary';

async function getSession(id: string) {
    const cookieStore = cookies();
    const token = cookieStore.get('Authentication')?.value;
    if (!token) return null;

    const res = await fetch(`${API_URL}/sessions/${id}`, {
        headers: { Cookie: `Authentication=${token}` },
        cache: 'no-store',
    });

    if (!res.ok) return null;
    return res.json();
}

async function getAllTrainers() {
    const cookieStore = cookies();
    const token = cookieStore.get('Authentication')?.value;
    if (!token) return [];

    const res = await fetch(`${API_URL}/admin/trainers?take=100`, {
        headers: { Cookie: `Authentication=${token}` },
        cache: 'no-store',
    });

    if (!res.ok) return [];
    const json = await res.json();
    return json.data;
}

export default async function SessionDetailPage({ params }: { params: { id: string } }) {
    const session = await getSession(params.id);
    if (!session) notFound();

    const trainers = await getAllTrainers();
    const sessionDate = new Date(session.date);

    return (
        <div className="space-y-8 max-w-6xl mx-auto pb-20">
            {/* Header with Breadcrumb */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                    <Link href="/admin" className="hover:text-primary transition-colors">Admin</Link>
                    <span>/</span>
                    <Link href="/admin/sessions" className="hover:text-primary transition-colors">Sessions</Link>
                    <span>/</span>
                    <span className="text-gray-900">Détail</span>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="icon" asChild className="rounded-xl h-10 w-10 border-border bg-white shadow-sm">
                            <Link href="/admin/sessions"><ArrowLeft className="h-5 w-5" /></Link>
                        </Button>
                        <div>
                            <h1 className="text-3xl font-black tracking-tight text-gray-900">{session.formation.title}</h1>
                            <div className="flex items-center gap-3 text-muted-foreground font-medium text-sm mt-1">
                                <span className="flex items-center gap-1">
                                    <Building2 className="h-3.5 w-3.5" />
                                    {session.client?.companyName || "Entreprise Inconnue"}
                                </span>
                                <span>•</span>
                                <Badge variant="secondary" className="font-bold text-[10px] tracking-wide uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                                    {session.formation.category?.name || "Général"}
                                </Badge>
                            </div>
                        </div>
                    </div>
                    <StatusBadge status={session.status} className="px-4 py-1.5 text-sm rounded-full" />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content (2 cols) */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Key Info Card */}
                    <Card className="rounded-[2rem] border-transparent shadow-sm bg-white overflow-hidden">
                        <CardContent className="p-0 flex flex-col md:flex-row">
                            {/* Date Box */}
                            <div className="bg-primary/5 min-w-[160px] p-8 flex flex-col items-center justify-center text-center border-r border-primary/5">
                                <span className="text-4xl font-black tracking-tighter text-gray-900 mb-1">
                                    {sessionDate.getDate()}
                                </span>
                                <span className="text-sm font-black uppercase tracking-widest text-primary mb-2">
                                    {sessionDate.toLocaleDateString('fr-FR', { month: 'long' })}
                                </span>
                                <span className="text-xs font-bold uppercase tracking-widest opacity-60 border border-current px-2 py-0.5 rounded-full">
                                    {sessionDate.getFullYear()}
                                </span>

                                <div className="mt-6 flex flex-col gap-1 items-center">
                                    <Badge variant="outline" className="bg-white text-xs font-bold border-border/60">
                                        {session.slot === 'AM' ? '09:00 - 12:30' : session.slot === 'PM' ? '13:30 - 17:00' : '09:00 - 17:00'}
                                    </Badge>
                                </div>
                            </div>

                            {/* Details */}
                            <div className="flex-1 p-8 space-y-6">
                                <div className="grid sm:grid-cols-2 gap-8">
                                    <div>
                                        <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
                                            <User className="h-3.5 w-3.5" /> Formateur
                                        </h3>
                                        {session.trainer ? (
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-10 w-10 border border-border">
                                                    <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                                        {session.trainer.firstName[0]}{session.trainer.lastName[0]}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-bold text-gray-900">{session.trainer.firstName} {session.trainer.lastName}</p>
                                                    <p className="text-xs text-muted-foreground">{session.trainer.email}</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-3 py-2 rounded-lg border border-amber-100">
                                                <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse"></span>
                                                <span className="font-bold text-sm">Non assigné</span>
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
                                            <Building2 className="h-3.5 w-3.5" /> Client
                                        </h3>
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600 border border-orange-100">
                                                <Building2 className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900">{session.client?.companyName}</p>
                                                <p className="text-xs text-muted-foreground">{session.client?.user?.email}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <Separator className="bg-border/50" />

                                <div>
                                    <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
                                        <MapPin className="h-3.5 w-3.5" /> Lieu
                                    </h3>
                                    <p className="text-sm font-medium text-gray-700 bg-muted/30 p-3 rounded-lg border border-border/50">
                                        {session.location || "Adresse par défaut du client (Non spécifiée)"}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Logistics & Participants Grid */}
                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Logistics */}
                        <Card className="rounded-[2rem] border-transparent shadow-sm bg-white h-full">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg font-black flex items-center gap-2">
                                    <Package className="h-5 w-5 text-primary" /> Logistique
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4">
                                <LogisticsSummary logistics={session.logistics} />
                            </CardContent>
                        </Card>

                        {/* Participants */}
                        <Card className="rounded-[2rem] border-transparent shadow-sm bg-white h-full">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg font-black flex items-center gap-2">
                                    <Users className="h-5 w-5 text-blue-600" /> Participants
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4">
                                <ParticipantsSummary participants={session.participants} />
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Sidebar Controls */}
                <div className="space-y-6">
                    <div className="sticky top-6 space-y-6">
                        <AdminBillingControls session={session} />
                        <AdminSessionControls session={session} trainers={trainers} />
                    </div>
                </div>
            </div>
        </div>
    )
}

