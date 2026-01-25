import { cookies } from 'next/headers';
import { API_URL } from '@/lib/config';
import { LogoutButton } from '@/components/LogoutButton';
import Link from 'next/link';
import { NextMissionCard } from '@/components/trainer/next-mission-card';

async function getTrainerMissions() {
    const cookieStore = cookies();
    const token = cookieStore.get('Authentication')?.value;

    if (!token) return null;

    // 1. Get User Profile to get Trainer ID
    const meRes = await fetch(`${API_URL}/auth/me`, {
        headers: { Cookie: `Authentication=${token}` },
        cache: 'no-store',
    });

    if (!meRes.ok) return null;
    const user = await meRes.json();
    const trainerId = user.formateur?.id;

    if (!trainerId) return null;

    // 2. Get Missions
    const missionsRes = await fetch(`${API_URL}/trainers/${trainerId}/missions`, {
        headers: { Cookie: `Authentication=${token}` },
        cache: 'no-store', // dynamic data
    });

    if (!missionsRes.ok) return [];

    return missionsRes.json();
}

export default async function TrainerPage() {
    const missions = await getTrainerMissions();

    if (!missions) {
        return (
            <div className="p-8">
                <h1 className="text-3xl font-bold mb-4">Espace Formateur</h1>
                <p className="text-red-500">Impossible de charger les informations du formateur.</p>
            </div>
        );
    }

    // Find next mission: First future mission (missions are already sorted by date asc from API if not we should sort)
    // Assuming API returns sorted.
    // We need to filter only missions >= today for the "Next Mission" card logic if the API returns past missions too.
    // But usually getTrainerMissions returns future missions? Let's check memory or assume standard list.
    // The API endpoint /trainers/:id/missions usually returns upcoming missions.
    // We'll take the first one as "Next Mission".
    const nextMission = missions.length > 0 ? missions[0] : null;

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Tableau de Bord</h1>
                    <p className="text-gray-500 mt-1">Gérez vos missions et votre activité</p>
                </div>
                <div className="flex items-center gap-4">
                    <Link href="/trainer/profile" className="text-sm font-medium hover:text-blue-600 transition-colors">
                        Mon Profil
                    </Link>
                </div>
            </div>

            {/* Focus: Prochaine Mission */}
            {nextMission && <NextMissionCard mission={nextMission} />}

            <h2 className="text-xl font-bold text-gray-900 mb-4">Toutes mes missions</h2>
            <div className="space-y-4">
                {missions.length === 0 ? (
                    <div className="bg-white p-6 rounded-lg shadow-sm border text-center text-gray-500">
                        Aucune mission à venir pour le moment.
                    </div>
                ) : (
                    missions.map((mission: any) => {
                        let participantCount = 0;
                        try {
                            const participants = mission.participants ? JSON.parse(mission.participants) : [];
                            participantCount = participants.length;
                        } catch (e) {
                            console.error('Failed to parse participants', e);
                        }

                        return (
                            <Link
                                href={`/trainer/missions/${mission.id}`}
                                key={mission.id}
                                className="block bg-white p-6 border rounded-lg shadow-sm hover:shadow-md hover:border-blue-500 transition-all duration-200 group"
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded">
                                                {new Date(mission.date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}
                                            </span>
                                            {mission.slot && (
                                                <span className="text-gray-500 text-sm border px-2 py-0.5 rounded">
                                                    {mission.slot}
                                                </span>
                                            )}
                                        </div>
                                        <h2 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                                            {mission.formation.title}
                                        </h2>
                                        <div className="flex flex-wrap gap-4 mt-2 text-gray-600">
                                            <p className="flex items-center gap-2">
                                                <span className="font-medium">Client :</span>
                                                {mission.client?.companyName || 'N/A'}
                                            </p>
                                            <p className="flex items-center gap-2">
                                                <span className="font-medium">Participants :</span>
                                                {participantCount}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-gray-400 group-hover:text-blue-500">
                                        →
                                    </div>
                                </div>
                            </Link>
                        );
                    })
                )}
            </div>
        </div>
    );
}
