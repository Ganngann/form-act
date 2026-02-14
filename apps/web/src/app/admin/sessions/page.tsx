import { API_URL } from '@/lib/config';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AdminBentoStats } from '@/components/admin/AdminBentoStats';
import { SessionRadarCard } from '@/components/admin/SessionRadarCard';
import { SessionSearchBar } from '@/components/admin/SessionSearchBar';
import { LayoutGrid, List, Archive, SlidersHorizontal } from 'lucide-react';

async function getSessions(status?: string, filter?: string, query?: string) {
  const cookieStore = cookies();
  const token = cookieStore.get('Authentication')?.value;
  if (!token) return [];

  let url = `${API_URL}/sessions?`;
  if (status) url += `status=${status}&`;
  if (filter) url += `filter=${filter}&`;
  if (query) url += `q=${query}&`;

  const res = await fetch(url, {
    headers: { Cookie: `Authentication=${token}` },
    cache: 'no-store',
  });

  if (!res.ok) return [];
  const sessions = await res.json();

  // Rule: If billedAt is present, it's archived (unless we are on an archives page, but here we aren't)
  return sessions.filter((s: any) => !s.billedAt);
}

const FILTER_LABELS: Record<string, string> = {
  'NO_TRAINER': 'ASSIGNATIONS REQUISES',
  'MISSING_LOGISTICS': 'LOGISTIQUE À FINALISER',
  'MISSING_PROOF': 'ÉMARGEMENTS À RÉCUPÉRER',
  'READY_TO_BILL': 'PRÊT À FACTURER',
};

export default async function SessionsListPage({
  searchParams
}: {
  searchParams: { status?: string, filter?: string, q?: string }
}) {
  const sessions = await getSessions(searchParams.status, searchParams.filter, searchParams.q);
  const activeLabel = searchParams.filter ? FILTER_LABELS[searchParams.filter] : 'TOUTES LES SESSIONS';

  return (
    <div className="space-y-12">
      {/* Header with Title and Archives Link */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <span className="inline-block px-3 py-1 rounded-md bg-indigo-50 border border-indigo-200 text-[10px] font-black uppercase tracking-widest text-indigo-600 mb-4">
            Opérations
          </span>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-gray-900 mb-2">
            Suivi des Sessions
          </h1>
          <p className="text-muted-foreground font-medium text-lg max-w-2xl text-slate-500 font-medium">
            Gérez le flux opérationnel et le planning des sessions actives.
          </p>
        </div>
        <Button variant="outline" asChild className="rounded-xl border-slate-200 font-bold gap-2">
          <Link href="/admin/sessions/archives">
            <Archive className="h-4 w-4" /> Voir les Archives
          </Link>
        </Button>
      </div>

      {/* 1. Bento Stats Section */}
      <AdminBentoStats activeFilter={searchParams.filter} />

      {/* 2. View Status Bar & Search */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 shadow-inner">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 bg-white rounded-lg flex items-center justify-center shadow-sm border border-slate-200">
            <SlidersHorizontal className="h-4 w-4 text-primary" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Vue active</span>
            <span className="text-sm font-black text-slate-700">{activeLabel}</span>
          </div>
        </div>

        <SessionSearchBar />
      </div>

      {/* 3. Results Section */}
      <div className="space-y-4">
        {sessions.length === 0 ? (
          <div className="bg-white rounded-[2rem] border-2 border-dashed p-12 text-center">
            <p className="text-slate-400 font-bold mb-4">Aucune session active ne correspond à vos critères.</p>
            {(searchParams.filter || searchParams.q) && (
              <Button asChild variant="secondary" className="rounded-xl font-bold">
                <Link href="/admin/sessions">Réinitialiser les filtres</Link>
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {sessions.map((session: any) => (
              <SessionRadarCard key={session.id} session={session} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
