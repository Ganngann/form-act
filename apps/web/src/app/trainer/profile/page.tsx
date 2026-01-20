import { cookies } from 'next/headers';
import { API_URL } from '@/lib/config';
import Link from 'next/link';
import { ProfileForm } from '@/components/trainer/profile-form';

async function getTrainerProfile() {
  const cookieStore = cookies();
  const token = cookieStore.get('Authentication')?.value;
  if (!token) return null;

  const meRes = await fetch(`${API_URL}/auth/me`, {
    headers: { Cookie: `Authentication=${token}` },
    cache: 'no-store',
  });
  if (!meRes.ok) {
     console.error('Profile Fetch Error Me:', meRes.status, await meRes.clone().text());
     return null;
  }
  const user = await meRes.json();
  const trainerId = user.formateur?.id;
  if (!trainerId) {
    console.error('No trainer ID in user profile:', user);
    return null;
  }

  const trainerRes = await fetch(`${API_URL}/trainers/${trainerId}`, {
    headers: { Cookie: `Authentication=${token}` },
    cache: 'no-store',
  });
  if (!trainerRes.ok) {
     console.error('Profile Fetch Error Trainer:', trainerRes.status, await trainerRes.clone().text());
     return null;
  }
  return trainerRes.json();
}

export default async function TrainerProfilePage() {
    const trainer = await getTrainerProfile();

    if (!trainer) return (
        <div className="p-8 text-center text-red-600">
            Impossible de charger le profil.
        </div>
    );

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <Link href="/trainer" className="text-blue-600 hover:underline mb-6 inline-flex items-center gap-1">
                ← Retour au tableau de bord
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Mon Profil Formateur</h1>
            <ProfileForm trainer={trainer} />
        </div>
    );
}
