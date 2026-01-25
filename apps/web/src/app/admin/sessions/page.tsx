import { API_URL } from '@/lib/config';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';

async function getSessions(status?: string, filter?: string) {
  const cookieStore = cookies();
  const token = cookieStore.get('Authentication')?.value;
  if (!token) return [];

  let url = `${API_URL}/sessions?`;
  if (status) url += `status=${status}&`;
  if (filter) url += `filter=${filter}&`;

  const res = await fetch(url, {
    headers: { Cookie: `Authentication=${token}` },
    cache: 'no-store',
  });

  if (!res.ok) return [];
  return res.json();
}

const FILTER_LABELS: Record<string, string> = {
  'NO_TRAINER': 'Sessions sans formateur',
  'MISSING_LOGISTICS': 'Logistique à compléter (J-7)',
  'MISSING_PROOF': 'Feuilles de présence manquantes',
  'READY_TO_BILL': 'Sessions à facturer',
};

export default async function SessionsListPage({ searchParams }: { searchParams: { status?: string, filter?: string } }) {
  const sessions = await getSessions(searchParams.status, searchParams.filter);
  const pageTitle = searchParams.filter ? FILTER_LABELS[searchParams.filter] : 'Gestion des Sessions';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">{pageTitle}</h1>
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
          <div className="p-12 text-center">
            <p className="text-muted-foreground">Aucune session trouvée pour ce filtre.</p>
            {searchParams.filter && (
              <Button variant="link" asChild className="mt-2 text-blue-600">
                <Link href="/admin/sessions">Voir toutes les sessions</Link>
              </Button>
            )}
          </div>
        ) : (
          <div className="divide-y text-sm">
            {sessions.map((session: any) => (
              <Link
                key={session.id}
                href={`/admin/sessions/${session.id}`}
                className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div>
                  <div className="font-semibold text-base">{session.formation.title}</div>
                  <div className="text-gray-500">
                    {new Date(session.date).toLocaleDateString("fr-FR")} • {session.client?.companyName || "Client Inconnu"}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    Formateur:{" "}
                    {session.trainer ? (
                      `${session.trainer.firstName} ${session.trainer.lastName}`
                    ) : (
                      <span className="text-amber-500 font-bold">NON ASSIGNÉ</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <StatusBadge status={session.status} />
                  <Button variant="ghost" size="sm">
                    Gérer
                  </Button>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
