import { LogoutButton } from '@/components/LogoutButton';
import { API_URL } from '@/lib/config';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { StatusBadge } from '@/components/ui/status-badge';

async function getUpcomingSessions() {
  const cookieStore = cookies();
  const token = cookieStore.get('Authentication')?.value;

  if (!token) return [];

  const today = new Date().toISOString().split('T')[0];

  const res = await fetch(`${API_URL}/sessions?status=CONFIRMED&start=${today}`, {
    headers: { Cookie: `Authentication=${token}` },
    cache: 'no-store',
  });

  if (!res.ok) return [];

  return res.json();
}

export default async function AdminDashboard() {
  const sessions = await getUpcomingSessions();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Bienvenue dans l&apos;espace administrateur.</p>
        </div>
      </div>

      {/* Widget Prochaines Sessions */}
      <div className="bg-white rounded-lg border shadow-sm p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Prochaines Sessions Confirmées</h2>
          <Link href="/admin/calendar" className="text-sm text-blue-600 hover:underline">
            Voir tout le calendrier
          </Link>
        </div>

        {sessions.length === 0 ? (
          <p className="text-muted-foreground text-sm">Aucune session confirmée à venir.</p>
        ) : (
          <div className="space-y-4">
            {sessions.slice(0, 5).map((session: any) => (
              <div key={session.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                <div>
                  <h3 className="font-medium">{session.formation.title}</h3>
                  <p className="text-sm text-gray-500">
                    {new Date(session.date).toLocaleDateString('fr-FR')} • {session.client?.companyName}
                  </p>
                </div>
                <StatusBadge status={session.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
