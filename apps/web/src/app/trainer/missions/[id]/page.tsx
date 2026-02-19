import { cookies } from 'next/headers';
import { API_URL } from '@/lib/config';
import { Participant } from '@/types/formation';

import { ProofUploadWidget } from '@/components/trainer/proof-upload-widget';
import { DownloadAttendanceButton } from '@/components/common/DownloadAttendanceButton';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MapPin, Calendar, Clock, User, Box, Users, Building2, CheckCircle2, FileText, ExternalLink } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

async function getSession(id: string) {
    const cookieStore = cookies();
    const token = cookieStore.get('Authentication')?.value;

    if (!token) return null;

    const res = await fetch(`${API_URL}/sessions/${id}`, {
        headers: { Cookie: `Authentication=${token}` },
        cache: 'no-store',
    });

    if (!res.ok) {
        if (res.status === 404) return null;
        return null; // Handle other errors gracefully
    }

    return res.json();
}

export default async function MissionDetailsPage({ params }: { params: { id: string } }) {
    const session = await getSession(params.id);

    if (!session) {
        notFound();
    }

    // Address Logic
    const address = session.location || session.client?.address;
    const mapLink = address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}` : undefined;

    // Parsing JSON fields
    let logistics: Record<string, any> | null = null;
    try {
        logistics = session.logistics ? JSON.parse(session.logistics) : null;
    } catch (e) {
        console.error('Failed to parse logistics', e);
        logistics = { raw: session.logistics }; // Fallback
    }

    let participants: Participant[] = [];
    try {
        participants = session.participants ? JSON.parse(session.participants) : [];
    } catch (e) {
        console.error('Failed to parse participants', e);
    }

    const sessionDate = new Date(session.date);

    return (
        <main className="min-h-screen bg-muted/10 pb-20">
            {/* Header / Hero */}
            <div className="bg-white border-b border-border py-8">
                <div className="container mx-auto px-4 max-w-5xl">
                    <Button variant="ghost" size="sm" asChild className="mb-6 hover:bg-muted text-muted-foreground group">
                        <Link href="/trainer" className="flex items-center gap-2 font-medium">
                            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                            Retour au tableau de bord
                        </Link>
                    </Button>

                    <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                        <div>
                            <div className="flex flex-wrap items-center gap-3 mb-4">
                                <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 uppercase tracking-widest font-black text-[10px] px-3 py-1">
                                    Mission Confirmée
                                </Badge>
                                <span className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                    <Clock className="h-4 w-4" />
                                    {session.slot === 'AM' ? 'Matin (09:00 - 12:30)' : session.slot === 'PM' ? 'Après-midi (13:30 - 17:00)' : 'Journée complète'}
                                </span>
                            </div>
                            <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-gray-900 mb-4 leading-tight">
                                {session.formation.title}
                            </h1>
                            <div className="flex items-center gap-2 text-lg text-muted-foreground font-medium">
                                <Calendar className="h-5 w-5 text-primary" />
                                Le <span className="text-gray-900 font-bold capitalize">
                                    {sessionDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                </span>
                            </div>
                        </div>

                        <div className="bg-muted/30 p-4 rounded-2xl border border-border min-w-[180px]">
                            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-2">Statut Session</p>
                            <div className="flex items-center gap-2">
                                <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse"></div>
                                <span className="font-bold text-green-700">Active</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 max-w-5xl py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Column: Core Info */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Client & Location Card */}
                        <Card className="rounded-[2rem] border-border shadow-sm overflow-hidden">
                            <CardHeader className="bg-white border-b border-border/50 p-8 pb-6">
                                <div className="flex items-center gap-3">
                                    <div className="h-12 w-12 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
                                        <MapPin className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-xl font-black tracking-tight">Lieu & Client</CardTitle>
                                        <p className="text-muted-foreground text-sm font-medium">Détails de votre intervention</p>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-8 space-y-8 bg-white">
                                <div className="grid md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-2">
                                            <Building2 className="h-4 w-4" /> Client
                                        </h3>
                                        <div className="bg-muted/5 p-4 rounded-2xl border border-border/50">
                                            <p className="font-bold text-lg text-gray-900 mb-1">{session.client?.companyName || "Non spécifié"}</p>
                                            <p className="text-sm text-muted-foreground font-medium">Contact: {session.client?.user?.name || "N/A"}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-2">
                                            <MapPin className="h-4 w-4" /> Adresse
                                        </h3>
                                        {address ? (
                                            <div className="bg-muted/5 p-4 rounded-2xl border border-border/50 h-full flex flex-col justify-between">
                                                <p className="text-gray-900 font-medium mb-3 leading-relaxed">{address}</p>
                                                <Button variant="default" size="sm" asChild className="w-full text-xs font-bold rounded-lg h-9">
                                                    <a href={mapLink} target="_blank" rel="noopener noreferrer">
                                                        Ouvrir GPS <ExternalLink className="ml-2 h-3 w-3" />
                                                    </a>
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl flex items-center gap-3 text-sm font-bold">
                                                <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">!</div>
                                                Adresse manquante
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Logistics Card */}
                        <Card className="rounded-[2rem] border-border shadow-sm overflow-hidden">
                            <CardHeader className="bg-white border-b border-border/50 p-8 pb-6">
                                <div className="flex items-center gap-3">
                                    <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                                        <Box className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-xl font-black tracking-tight">Logistique</CardTitle>
                                        <p className="text-muted-foreground text-sm font-medium">Besoins matériels et techniques</p>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-8 bg-white">
                                {logistics && Object.keys(logistics).length > 0 ? (
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        {Object.entries(logistics).map(([key, value]) => (
                                            <div key={key} className="bg-muted/5 p-5 rounded-2xl border border-border/50 hover:border-primary/20 transition-colors">
                                                <dt className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-2">
                                                    <CheckCircle2 className="h-3 w-3 text-primary" />
                                                    {key.replace(/([A-Z])/g, ' $1').trim()}
                                                </dt>
                                                <dd className="text-gray-900 font-bold text-lg">{String(value)}</dd>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 bg-muted/5 rounded-2xl border border-dashed border-border">
                                        <Box className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                                        <p className="text-muted-foreground font-medium">Aucune information logistique spécifiée.</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column: Actions & Participants */}
                    <div className="lg:col-span-1 space-y-8">
                        {/* Administrative Action */}
                        <div className="bg-white p-2 rounded-[2.5rem] shadow-sm border border-border">
                            <ProofUploadWidget
                                sessionId={session.id}
                                status={session.status}
                                proofUrl={session.proofUrl}
                            />
                        </div>

                        {/* Participants List */}
                        <Card className="rounded-[2rem] border-border shadow-sm bg-white overflow-hidden">
                            <CardHeader className="p-6 pb-4 border-b border-border/50 flex flex-row items-center justify-between">
                                <CardTitle className="text-lg font-black tracking-tight flex items-center gap-2">
                                    <Users className="h-5 w-5 text-primary" /> Participants
                                </CardTitle>
                                <div className="flex items-center gap-2">
                                    <Badge variant="secondary" className="font-bold">{participants.length}</Badge>
                                    <DownloadAttendanceButton
                                        sessionId={session.id}
                                        sessionStatus={session.status}
                                        size="sm"
                                        variant="outline"
                                        className="h-7 text-xs px-2"
                                    >
                                        PDF
                                    </DownloadAttendanceButton>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6">
                                {participants.length > 0 ? (
                                    <ul className="space-y-4">
                                        {participants.map((p: Participant, i: number) => {
                                            const initials = (p.name || '?').split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();
                                            return (
                                                <li key={i} className="flex items-center gap-4 p-3 rounded-2xl bg-muted/5 hover:bg-muted/10 transition-colors border border-transparent hover:border-border/50">
                                                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-sm border border-white/20">
                                                        {initials}
                                                    </div>
                                                    <div className="overflow-hidden">
                                                        <p className="font-bold text-gray-900 text-sm truncate">{p.name || `${p.firstName} ${p.lastName}` || 'Nom inconnu'}</p>
                                                        <p className="text-xs text-muted-foreground truncate">{p.email || 'Email non renseigné'}</p>
                                                    </div>
                                                </li>
                                            )
                                        })}
                                    </ul>
                                ) : (
                                    <div className="text-center py-10">
                                        <Users className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
                                        <p className="text-muted-foreground font-medium text-sm">La liste des participants n&apos;a pas encore été communiquée.</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                    </div>
                </div>
            </div>
        </main>
    );
}
