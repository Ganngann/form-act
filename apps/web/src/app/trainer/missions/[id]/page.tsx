import { cookies } from 'next/headers';
import { API_URL } from '@/lib/config';
import { LogoutButton } from '@/components/LogoutButton';
import { ProofUploadWidget } from '@/components/trainer/proof-upload-widget';
import Link from 'next/link';
import { notFound } from 'next/navigation';

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
    let logistics = null;
    try {
        logistics = session.logistics ? JSON.parse(session.logistics) : null;
    } catch (e) {
        console.error('Failed to parse logistics', e);
        logistics = { raw: session.logistics }; // Fallback
    }

    let participants = [];
    try {
        participants = session.participants ? JSON.parse(session.participants) : [];
    } catch (e) {
        console.error('Failed to parse participants', e);
    }

    return (
        <div className="p-8 max-w-5xl mx-auto">
            {/* Header with Back Link */}
            <div className="mb-8">
                <Link href="/trainer" className="text-blue-600 hover:underline mb-4 inline-flex items-center gap-1">
                    ← Retour aux missions
                </Link>
                <div className="flex justify-between items-start mt-2">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{session.formation.title}</h1>
                        <div className="flex gap-3 mt-3 text-gray-600">
                            <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium border border-blue-100">
                                {new Date(session.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                            </span>
                            {session.slot && (
                                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium border border-gray-200">
                                    {session.slot}
                                </span>
                            )}
                        </div>
                    </div>
                    <LogoutButton />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Logistics & Address (2 cols wide on large screens) */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Client & Location */}
                    <div className="bg-white p-6 rounded-xl border shadow-sm">
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                            📍 Lieu & Client
                        </h2>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Client</h3>
                                <p className="font-semibold text-gray-900 text-lg">{session.client?.companyName}</p>
                                <p className="text-gray-600">{session.client?.user?.name}</p>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Adresse</h3>
                                {address ? (
                                    <div>
                                        <p className="text-gray-900 mb-3">{address}</p>
                                        <a
                                            href={mapLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                                        >
                                            Voir sur Google Maps ↗
                                        </a>
                                    </div>
                                ) : (
                                    <div className="bg-red-50 border border-red-100 text-red-600 p-3 rounded-lg flex items-center gap-2">
                                        ⚠️ Adresse manquante
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Logistics */}
                    <div className="bg-white p-6 rounded-xl border shadow-sm">
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                            📦 Logistique & Matériel
                        </h2>
                        {logistics ? (
                            <div className="grid sm:grid-cols-2 gap-4">
                                {Object.entries(logistics).map(([key, value]) => (
                                    <div key={key} className="bg-gray-50 p-4 rounded-lg">
                                        <dt className="text-sm font-medium text-gray-500 capitalize mb-1">{key.replace(/([A-Z])/g, ' $1').trim()}</dt>
                                        <dd className="text-gray-900 font-medium">{String(value)}</dd>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 italic bg-gray-50 p-4 rounded-lg text-center">Aucune information logistique spécifiée pour cette session.</p>
                        )}
                    </div>
                </div>

                {/* Right Column: Participants */}
                <div className="lg:col-span-1 space-y-6">
                    <ProofUploadWidget
                        sessionId={session.id}
                        status={session.status}
                        proofUrl={session.proofUrl}
                    />

                    <div className="bg-white p-6 rounded-xl border shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold">Participants</h2>
                            <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-md text-sm font-medium">
                                {participants.length}
                            </span>
                        </div>

                        {participants.length > 0 ? (
                            <ul className="space-y-3">
                                {participants.map((p: any, i: number) => (
                                    <li key={i} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                                        <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm shrink-0">
                                            {(p.name || '?').charAt(0).toUpperCase()}
                                        </div>
                                        <div className="overflow-hidden">
                                            <p className="font-medium text-gray-900 truncate">{p.name || `${p.firstName} ${p.lastName}` || 'Nom inconnu'}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="text-center py-8 bg-gray-50 rounded-lg">
                                <p className="text-gray-500 italic">Aucun participant inscrit.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
