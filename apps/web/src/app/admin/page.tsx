import { LogoutButton } from '@/components/LogoutButton';
import { API_URL } from '@/lib/config';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { StatusBadge } from '@/components/ui/status-badge';
import { MasterCalendar } from '@/components/admin/master-calendar';
import { AdminBentoStats } from '@/components/admin/AdminBentoStats';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, ArrowRight, User, Building2, LayoutDashboard } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

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
    <div className="space-y-12">
      {/* Header */}
      <AdminHeader
        className="mb-8"
        badge="Espace Administrateur"
        badgeClassName="bg-primary/5 border-primary/20 text-primary"
        title="Dashboard"
        description="Vue d'ensemble de l'activité, gestion des sessions et suivi des priorités."
      >
        <div className="hidden md:block">
          <div className="h-16 w-16 bg-primary/5 rounded-2xl flex items-center justify-center text-primary">
            <LayoutDashboard className="h-8 w-8" />
          </div>
        </div>
      </AdminHeader>

      <div className="grid grid-cols-1 gap-12">
        {/* Actions Prioritaires */}
        <section className="space-y-6">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-black uppercase tracking-widest text-muted-foreground">Indicateurs Opérationnels</h2>
            <div className="h-px flex-1 bg-border"></div>
          </div>
          <AdminBentoStats />
        </section>

        {/* Calendrier Principal */}
        <section className="space-y-6">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-black uppercase tracking-widest text-muted-foreground">Planning Global</h2>
            <div className="h-px flex-1 bg-border"></div>
          </div>
          <Card className="rounded-[2.5rem] border-border shadow-sm overflow-hidden bg-white">
            <CardContent className="p-0">
              <MasterCalendar />
            </CardContent>
          </Card>
        </section>

        {/* Widget Prochaines Sessions */}
        <section className="space-y-6">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-black uppercase tracking-widest text-muted-foreground">Prochaines Sessions Confirmées</h2>
            <div className="h-px flex-1 bg-border"></div>
            <Link href="/admin/calendar" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
              Voir tout le calendrier <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <Card className="rounded-[2rem] border-border shadow-sm overflow-hidden bg-white/50">
            <CardContent className="p-0">
              {sessions.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-3 opacity-20" />
                  <p className="font-medium">Aucune session confirmée à venir.</p>
                </div>
              ) : (
                <div className="divide-y divide-border/50">
                  {sessions.slice(0, 5).map((session: any) => {
                    const sessionDate = new Date(session.date);
                    return (
                      <Link
                        key={session.id}
                        href={`/admin/sessions/${session.id}`}
                        className="flex flex-col md:flex-row items-center gap-6 p-6 hover:bg-white hover:shadow-md transition-all group"
                      >
                        {/* Date Box */}
                        <div className="h-16 w-16 rounded-xl bg-muted/10 flex flex-col items-center justify-center shrink-0 border border-border/50 group-hover:border-primary/20 group-hover:bg-primary/5 transition-colors">
                          <span className="text-xl font-black text-gray-900 group-hover:text-primary">{sessionDate.getDate()}</span>
                          <span className="text-[10px] uppercase font-bold text-muted-foreground group-hover:text-primary/70">{sessionDate.toLocaleDateString('fr-FR', { month: 'short' })}</span>
                        </div>

                        <div className="flex-1 min-w-0 grid md:grid-cols-2 gap-4 w-full">
                          <div>
                            <h3 className="font-bold text-gray-900 truncate group-hover:text-primary transition-colors text-lg">{session.formation.title}</h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                              <Building2 className="h-3 w-3" />
                              <span className="font-medium">{session.client?.companyName || 'Client inconnu'}</span>
                            </div>
                          </div>
                          <div className="flex items-center md:justify-end gap-3">
                            <StatusBadge status={session.status} />
                            <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                          </div>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}

