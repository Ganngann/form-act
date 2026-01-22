import { API_URL } from '@/lib/config';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';

async function getSessions(status?: string) {
  const cookieStore = cookies();
  const token = cookieStore.get('Authentication')?.value;
  if (!token) return [];

  let url = `${API_URL}/sessions`;
  if (status) url += `?status=${status}`;

  const res = await fetch(url, {
    headers: { Cookie: `Authentication=${token}` },
    cache: 'no-store',
  });

  if (!res.ok) return [];
  return res.json();
}

export default async function SessionsListPage({ searchParams }: { searchParams: { status?: string } }) {
  const sessions = await getSessions(searchParams.status);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Gestion des Sessions</h1>
      </div>

      <div className="flex gap-2">
         <Button variant={!searchParams.status ? "default" : "outline"} asChild>
            <Link href="/admin/sessions">Toutes</Link>
         </Button>
         <Button variant={searchParams.status === "PENDING_ASSIGNMENT" ? "default" : "outline"} asChild>
            <Link href="/admin/sessions?status=PENDING_ASSIGNMENT">À Assigner</Link>
         </Button>
         <Button variant={searchParams.status === "CONFIRMED" ? "default" : "outline"} asChild>
            <Link href="/admin/sessions?status=CONFIRMED">Confirmées</Link>
         </Button>
         <Button variant={searchParams.status === "CANCELLED" ? "default" : "outline"} asChild>
            <Link href="/admin/sessions?status=CANCELLED">Annulées</Link>
         </Button>
      </div>

      <div className="bg-white rounded-lg border shadow-sm">
         {sessions.length === 0 ? (
             <div className="p-8 text-center text-muted-foreground">Aucune session trouvée.</div>
         ) : (
             <div className="divide-y">
                 {sessions.map((session: any) => (
                     <div key={session.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                         <div>
                             <div className="font-semibold">{session.formation.title}</div>
                             <div className="text-sm text-gray-500">
                                 {new Date(session.date).toLocaleDateString('fr-FR')} • {session.client?.companyName || 'Client Inconnu'}
                             </div>
                             <div className="text-xs text-gray-400 mt-1">
                                 Formateur: {session.trainer ? `${session.trainer.firstName} ${session.trainer.lastName}` : <span className="text-amber-500 font-bold">NON ASSIGNÉ</span>}
                             </div>
                         </div>
                         <div className="flex items-center gap-4">
                             <StatusBadge status={session.status} />
                             <Button variant="ghost" size="sm" asChild>
                                 <Link href={`/admin/sessions/${session.id}`}>Gérer</Link>
                             </Button>
                         </div>
                     </div>
                 ))}
             </div>
         )}
      </div>
    </div>
  );
}
