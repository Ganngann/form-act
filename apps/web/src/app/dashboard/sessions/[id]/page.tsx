import { API_URL } from '@/lib/config';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { StatusBadge } from '@/components/ui/status-badge';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, User, Info } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { SessionLogisticsManager } from '@/components/booking/session-logistics-manager';

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

export default async function ClientSessionDetailPage({ params }: { params: { id: string } }) {
    const session = await getSession(params.id);
    if (!session) notFound();

    return (
        <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex items-center gap-6">
                <Button variant="ghost" size="icon" asChild className="rounded-full hover:bg-primary/10 hover:text-primary transition-all">
                    <Link href="/dashboard"><ArrowLeft className="h-6 w-6" /></Link>
                </Button>
                <h1 className="text-4xl font-bold tracking-tight">Détails de ma session.</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Header Info Card */}
                    <section className="bg-white p-8 rounded-[2rem] border border-border shadow-sm space-y-8 relative overflow-hidden">
                        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                            <div>
                                <h2 className="text-3xl font-bold text-primary tracking-tight leading-tight">
                                    {session.formation.title}
                                </h2>
                                <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mt-2">
                                    {session.formation.category?.name}
                                </p>
                            </div>
                            <StatusBadge status={session.status} />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 pt-8 border-t border-border/50">
                            <div className="flex items-start gap-4">
                                <div className="h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center shrink-0">
                                    <Calendar className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <span className="block text-[10px] font-black text-muted-foreground uppercase tracking-[2px] mb-1">Date & Heure</span>
                                    <p className="font-bold text-foreground">
                                        {format(new Date(session.date), "EEEE d MMMM yyyy", { locale: fr })}
                                    </p>
                                    <span className="text-[10px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded mt-2 inline-block uppercase tracking-wider">
                                        {session.slot === 'ALL_DAY' ? 'Journée entière' : session.slot}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center shrink-0">
                                    <User className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <span className="block text-[10px] font-black text-muted-foreground uppercase tracking-[2px] mb-1">Formateur</span>
                                    <p className="font-bold text-foreground">
                                        {session.trainer
                                            ? `${session.trainer.firstName} ${session.trainer.lastName}`
                                            : "En attente d'assignation"}
                                    </p>
                                    {session.trainer && (
                                        <p className="text-xs font-medium text-muted-foreground mt-1">Expert en {session.formation.expertise?.name}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </section>

                    <SessionLogisticsManager session={session} />
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <section className="bg-primary/5 p-8 rounded-[2rem] border border-primary/10 space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                <Info className="h-5 w-5" />
                            </div>
                            <h3 className="font-black text-primary uppercase text-xs tracking-widest">À noter</h3>
                        </div>
                        <p className="text-sm font-medium text-muted-foreground leading-relaxed italic border-l-2 border-primary/20 pl-4">
                            &quot;Les modifications logistiques sont possibles jusqu&apos;à 7 jours avant la date de la séance.&quot;
                        </p>
                        <div className="pt-2">
                            <Button variant="outline" className="w-full h-12 rounded-xl border-primary/20 text-primary hover:bg-primary/5 font-bold shadow-none" asChild>
                                <Link href={`/formation/${session.formationId}`}>Voir le programme formation</Link>
                            </Button>
                        </div>
                    </section>

                    <div className="text-center p-6 border border-dashed border-border rounded-[2rem] bg-muted/5">
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Besoin d&apos;aide ?</p>
                        <p className="text-xs font-medium text-muted-foreground/60 mt-1 uppercase tracking-tight">Contactez notre support administratif.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
