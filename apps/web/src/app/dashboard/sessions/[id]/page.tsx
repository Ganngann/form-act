import { API_URL } from '@/lib/config';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { StatusBadge } from '@/components/ui/status-badge';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, User, MapPin, Info } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

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
        <div className="container mx-auto py-10 px-4 max-w-4xl">
            <div className="flex items-center gap-4 mb-8">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/dashboard"><ArrowLeft className="h-5 w-5" /></Link>
                </Button>
                <h1 className="text-2xl font-bold tracking-tight">Détails de ma session</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="md:col-span-2 space-y-8">
                    {/* Header Info */}
                    <section className="bg-white p-6 rounded-xl border shadow-sm space-y-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <h2 className="text-2xl font-bold text-primary">{session.formation.title}</h2>
                                <p className="text-muted-foreground">{session.formation.category?.name}</p>
                            </div>
                            <StatusBadge status={session.status} />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="flex items-start gap-3">
                                <Calendar className="h-5 w-5 text-blue-500 mt-0.5" />
                                <div>
                                    <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Date & Heure</span>
                                    <p className="font-medium">
                                        {format(new Date(session.date), "EEEE d MMMM yyyy", { locale: fr })}
                                    </p>
                                    <span className="text-sm px-2 py-0.5 bg-secondary rounded mt-1 inline-block">
                                        {session.slot}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <User className="h-5 w-5 text-blue-500 mt-0.5" />
                                <div>
                                    <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Formateur</span>
                                    <p className="font-medium">
                                        {session.trainer
                                            ? `${session.trainer.firstName} ${session.trainer.lastName}`
                                            : "En attente d'assignation"}
                                    </p>
                                    {session.trainer && (
                                        <p className="text-xs text-muted-foreground">Expert en {session.formation.expertise?.name}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Logistics */}
                    <section className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <MapPin className="h-5 w-5 text-primary" />
                            <h3 className="font-bold text-lg">Lieu et Logistique</h3>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <span className="block text-xs font-semibold text-gray-500 uppercase mb-1">Lieu de la formation</span>
                                <p className="font-medium bg-gray-50 p-3 rounded border">
                                    {session.location || "À confirmer - L'adresse de votre entreprise sera utilisée par défaut."}
                                </p>
                            </div>

                            <div>
                                <span className="block text-xs font-semibold text-gray-500 uppercase mb-1">Détails logistiques</span>
                                <div className="bg-gray-50 p-4 rounded border text-sm whitespace-pre-wrap min-h-[100px]">
                                    {(() => {
                                        if (!session.logistics) return "Aucune information logistique renseignée pour le moment.";
                                        try {
                                            const logObj = JSON.parse(session.logistics);
                                            return Object.entries(logObj).map(([key, val]) => (
                                                <div key={key} className="mb-2 last:mb-0">
                                                    <span className="font-bold capitalize">{key}:</span> {String(val)}
                                                </div>
                                            ));
                                        } catch (e) {
                                            return session.logistics;
                                        }
                                    })()}
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <section className="bg-blue-50 p-6 rounded-xl border border-blue-100 space-y-4">
                        <div className="flex items-center gap-2">
                            <Info className="h-5 w-5 text-blue-600" />
                            <h3 className="font-bold text-blue-900">À noter</h3>
                        </div>
                        <p className="text-sm text-blue-800 leading-relaxed">
                            Les modifications logistiques sont possibles jusqu&apos;à 7 jours avant la date de la séance.
                        </p>
                        <div className="pt-2">
                            <Button variant="outline" className="w-full bg-white border-blue-200 text-blue-700 hover:bg-blue-100" asChild>
                                <Link href="/catalogue">Voir le programme</Link>
                            </Button>
                        </div>
                    </section>

                    <div className="text-center p-4">
                        <p className="text-xs text-muted-foreground">Une question ? Contactez notre support administratif.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
