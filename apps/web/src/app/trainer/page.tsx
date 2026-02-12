import { cookies } from 'next/headers';
import { API_URL } from '@/lib/config';
import { LogoutButton } from '@/components/LogoutButton';
import Link from 'next/link';
import { NextMissionCard } from '@/components/trainer/next-mission-card';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, ArrowRight, User } from 'lucide-react';

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
            <div className="min-h-screen flex items-center justify-center bg-muted/10 p-4">
                <div className="text-center space-y-4">
                    <div className="h-16 w-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <User className="h-8 w-8" />
                    </div>
                    <h1 className="text-3xl font-black text-gray-900">Accès Refusé</h1>
                    <p className="text-muted-foreground font-medium">Impossible de charger les informations du formateur.</p>
                </div>
            </div>
        );
    }

    // Find next mission
    const nextMission = missions.length > 0 ? missions[0] : null;

    return (
        <main className="min-h-screen bg-muted/10 pb-20">
            {/* Header */}
            <header className="bg-white border-b border-border py-12 px-4 mb-8">
                <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <span className="inline-block px-3 py-1 rounded-md bg-primary/5 border border-primary/20 text-[10px] font-black uppercase tracking-widest text-primary mb-4">
                            Espace Formateur
                        </span>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-gray-900 mb-2">
                            Tableau de Bord
                        </h1>
                        <p className="text-muted-foreground font-medium text-lg">
                            Gérez vos missions, consultez vos plannings et accédez aux documents.
                        </p>
                    </div>
                </div>
            </header>

            <div className="max-w-5xl mx-auto px-4">

                {/* Focus: Prochaine Mission */}
                {nextMission && (
                    <div className="mb-16">
                        <div className="flex items-center gap-4 mb-6">
                            <h2 className="text-xl font-black uppercase tracking-widest text-muted-foreground">À Venir</h2>
                            <div className="h-px flex-1 bg-border"></div>
                        </div>
                        <NextMissionCard mission={nextMission} />
                    </div>
                )}

                <div>
                    <div className="flex items-center gap-4 mb-8">
                        <h2 className="text-xl font-black uppercase tracking-widest text-muted-foreground">Toutes mes missions</h2>
                        <div className="h-px flex-1 bg-border"></div>
                        <Badge variant="outline" className="text-xs font-bold px-3 py-1 bg-white border-border text-muted-foreground">
                            {missions.length} Mission{missions.length > 1 ? 's' : ''}
                        </Badge>
                    </div>

                    <div className="grid gap-6">
                        {missions.length === 0 ? (
                            <Card className="border-dashed border-2 border-border bg-white/50 p-12 text-center rounded-[2rem]">
                                <p className="text-muted-foreground font-bold text-lg">Aucune mission planifiée pour le moment.</p>
                            </Card>
                        ) : (
                            missions.map((mission: any) => {
                                const missionDate = new Date(mission.date);
                                return (
                                    <Link
                                        href={`/trainer/missions/${mission.id}`}
                                        key={mission.id}
                                        className="block group"
                                    >
                                        <Card className="rounded-[2rem] border-transparent shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-300 bg-white overflow-hidden group-hover:-translate-y-1">
                                            <CardContent className="p-0 flex flex-col md:flex-row">
                                                {/* Date Column */}
                                                <div className="bg-primary/5 min-w-[140px] p-6 flex flex-col items-center justify-center text-center border-r border-primary/5 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                                                    <span className="text-3xl font-black tracking-tighter mb-1">
                                                        {missionDate.getDate()}
                                                    </span>
                                                    <span className="text-xs font-black uppercase tracking-widest opacity-60 mb-2">
                                                        {missionDate.toLocaleDateString('fr-FR', { month: 'short' })}
                                                    </span>
                                                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-80 border border-current px-2 py-0.5 rounded-full">
                                                        {missionDate.getFullYear()}
                                                    </span>
                                                </div>

                                                {/* Content */}
                                                <div className="flex-1 p-6 md:p-8 flex flex-col justify-center">
                                                    <div className="flex flex-wrap items-center gap-3 mb-3">
                                                        <Badge variant="secondary" className="bg-muted text-muted-foreground hover:bg-muted font-bold tracking-wide uppercase text-[10px]">
                                                            {mission.slot === 'AM' ? 'Matin' : mission.slot === 'PM' ? 'Après-midi' : 'Journée'}
                                                        </Badge>
                                                        {mission.client?.companyName && (
                                                            <span className="text-xs font-bold text-primary px-2 py-0.5 rounded bg-primary/5 border border-primary/10">
                                                                {mission.client.companyName}
                                                            </span>
                                                        )}
                                                    </div>

                                                    <h3 className="text-2xl font-bold text-gray-900 group-hover:text-primary transition-colors mb-2">
                                                        {mission.formation.title}
                                                    </h3>

                                                    <div className="flex items-center gap-6 text-sm font-medium text-muted-foreground">
                                                        {mission.location && (
                                                            <div className="flex items-center gap-2">
                                                                <MapPin className="h-4 w-4 text-primary/50" />
                                                                <span className="truncate max-w-[200px]">{mission.location}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Action */}
                                                <div className="bg-white p-6 flex items-center justify-center md:border-l border-border">
                                                    <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-300">
                                                        <ArrowRight className="h-5 w-5" />
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}
