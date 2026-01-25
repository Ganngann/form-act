import { API_URL } from '@/lib/config';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { AdminSessionControls } from '@/components/admin/admin-session-controls';
import { StatusBadge } from '@/components/ui/status-badge';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

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
    return json.data; // Structure { data, total }
}

export default async function SessionDetailPage({ params }: { params: { id: string } }) {
    const session = await getSession(params.id);
    if (!session) notFound();

    const trainers = await getAllTrainers();

    return (
        <div className="space-y-6 max-w-4xl">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/admin/sessions"><ArrowLeft className="h-5 w-5" /></Link>
                </Button>
                <h1 className="text-2xl font-bold tracking-tight">Détail Session</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Info Session */}
                <div className="md:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-lg border shadow-sm space-y-4">
                        <div className="flex justify-between items-start">
                            <div>
                                <h2 className="text-xl font-bold">{session.formation.title}</h2>
                                <p className="text-muted-foreground">{session.formation.category?.name}</p>
                            </div>
                            <StatusBadge status={session.status} />
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="block font-medium text-gray-500">Date</span>
                                {new Date(session.date).toLocaleDateString('fr-FR')} ({session.slot})
                            </div>
                            <div>
                                <span className="block font-medium text-gray-500">Client</span>
                                {session.client?.companyName}
                                <div className="text-xs text-muted-foreground">{session.client?.user?.email}</div>
                            </div>
                            <div>
                                <span className="block font-medium text-gray-500">Formateur Actuel</span>
                                {session.trainer ? (
                                    <span>{session.trainer.firstName} {session.trainer.lastName}</span>
                                ) : (
                                    <span className="text-amber-600 font-semibold">Non assigné</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Lieu & Logistique */}
                    <div className="bg-white p-6 rounded-lg border shadow-sm space-y-6">
                        <div>
                            <h3 className="font-semibold mb-3 flex items-center gap-2">📍 Lieu de la formation</h3>
                            <p className="p-3 bg-gray-50 rounded border text-sm">
                                {session.location || "Adresse par défaut du client"}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="font-semibold mb-3 flex items-center gap-2">📦 Matériel & Logistique</h3>
                                <div className="bg-gray-50 p-4 rounded border text-sm space-y-2">
                                    {(() => {
                                        if (!session.logistics) return <p className="text-muted-foreground italic">Non renseigné</p>;
                                        try {
                                            const log = JSON.parse(session.logistics);
                                            return (
                                                <div className="space-y-2">
                                                    {log.videoMaterial?.length > 0 && (
                                                        <p><strong>Vidéo:</strong> {log.videoMaterial.join(", ")}</p>
                                                    )}
                                                    {log.writingMaterial?.length > 0 && (
                                                        <p><strong>Écrit:</strong> {log.writingMaterial.join(", ")}</p>
                                                    )}
                                                    <p><strong>Wifi:</strong> {log.wifi === "yes" ? "Oui" : "Non"}</p>
                                                    <p><strong>Subsides:</strong> {log.subsidies === "yes" ? "Oui" : "Non"}</p>
                                                    {log.accessDetails && (
                                                        <div className="pt-2 border-t mt-2">
                                                            <strong>Accès:</strong>
                                                            <p className="whitespace-pre-wrap text-xs mt-1">{log.accessDetails}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        } catch (e) {
                                            return <pre className="text-xs">{session.logistics}</pre>;
                                        }
                                    })()}
                                </div>
                            </div>

                            <div>
                                <h3 className="font-semibold mb-3 flex items-center gap-2">👥 Participants</h3>
                                <div className="bg-gray-50 p-4 rounded border text-sm space-y-2">
                                    {(() => {
                                        if (!session.participants) return <p className="text-muted-foreground italic">Liste vide</p>;
                                        try {
                                            const parts = JSON.parse(session.participants);
                                            if (parts.length === 0) return <p className="text-muted-foreground italic">Aucun participant</p>;
                                            return (
                                                <ul className="space-y-1">
                                                    {parts.map((p: any, i: number) => (
                                                        <li key={i} className="border-b last:border-0 pb-1 flex flex-col">
                                                            <span className="font-medium">{p.firstName || p.name} {p.lastName}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            );
                                        } catch (e) {
                                            return <p className="text-destructive">Erreur format participants</p>;
                                        }
                                    })()}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <div>
                    <AdminSessionControls session={session} trainers={trainers} />
                </div>
            </div>
        </div>
    )
}
