import { cookies } from 'next/headers';
import { API_URL } from '@/lib/config';
import { LogoutButton } from '@/components/LogoutButton';
import Link from 'next/link';

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
            <LogoutButton />
        </div>
     );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
            <h1 className="text-3xl font-bold text-gray-900">Mes Missions</h1>
            <p className="text-gray-500 mt-1">Gérez vos prochaines sessions de formation</p>
        </div>
        <LogoutButton />
      </div>

      <div className="space-y-4">
        {missions.length === 0 ? (
            <div className="bg-white p-6 rounded-lg shadow-sm border text-center text-gray-500">
                Aucune mission à venir pour le moment.
            </div>
        ) : (
            missions.map((mission: any) => (
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
                            <p className="text-gray-600 mt-2 flex items-center gap-2">
                                <span className="font-medium">Client :</span>
                                {mission.client?.companyName || 'N/A'}
                            </p>
                        </div>
                        <div className="text-gray-400 group-hover:text-blue-500">
                            →
                        </div>
                    </div>
                </Link>
            ))
        )}
      </div>
    </div>
  );
}
