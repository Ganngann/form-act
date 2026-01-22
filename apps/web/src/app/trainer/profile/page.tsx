import { cookies } from 'next/headers';
import { API_URL } from '@/lib/config';
import Link from 'next/link';
import { ProfileForm } from '@/components/trainer/profile-form';
import { CalendarExport } from '@/components/trainer/calendar-export';

async function getData() {
  const cookieStore = cookies();
  const token = cookieStore.get('Authentication')?.value;
  if (!token) return { trainer: null, calendarUrl: null };

  const meRes = await fetch(`${API_URL}/auth/me`, {
    headers: { Cookie: `Authentication=${token}` },
    cache: 'no-store',
  });

  if (!meRes.ok) {
     console.error('Profile Fetch Error Me:', meRes.status);
     return { trainer: null, calendarUrl: null };
  }

  const user = await meRes.json();
  const trainerId = user.formateur?.id;

  if (!trainerId) {
    console.error('No trainer ID in user profile:', user);
    return { trainer: null, calendarUrl: null };
  }

  const [trainerRes, calendarRes] = await Promise.all([
      fetch(`${API_URL}/trainers/${trainerId}`, {
        headers: { Cookie: `Authentication=${token}` },
        cache: 'no-store',
      }),
      fetch(`${API_URL}/trainers/${trainerId}/calendar-url`, {
        headers: { Cookie: `Authentication=${token}` },
        cache: 'no-store',
      })
  ]);

  if (!trainerRes.ok) {
     return { trainer: null, calendarUrl: null };
  }

  const trainer = await trainerRes.json();

  let calendarUrl = null;
  if (calendarRes.ok) {
      const data = await calendarRes.json();
      calendarUrl = data.url;
  }

  return { trainer, calendarUrl };
}

export default async function TrainerProfilePage() {
    const { trainer, calendarUrl } = await getData();

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
            <CalendarExport url={calendarUrl} />
        </div>
    );
}
