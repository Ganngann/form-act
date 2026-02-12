import { cookies } from 'next/headers';
import { API_URL } from '@/lib/config';
import { ProfileForm } from '@/components/trainer/profile-form';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { User, MapPin } from 'lucide-react';

async function getData() {
  const cookieStore = cookies();
  const token = cookieStore.get('Authentication')?.value;
  if (!token) return { trainer: null };

  let meRes;
  let attempts = 0;
  const maxAttempts = 3;

  while (attempts < maxAttempts) {
    try {
      meRes = await fetch(`${API_URL}/auth/me`, {
        headers: { Cookie: `Authentication=${token}` },
        cache: 'no-store',
      });
      if (meRes.ok) break;
    } catch (e) {
      console.warn(`Attempt ${attempts + 1} failed for /auth/me`, e);
    }
    attempts++;
    if (attempts < maxAttempts) await new Promise(r => setTimeout(r, 500));
  }

  if (!meRes || !meRes.ok) {
    return { trainer: null };
  }

  const user = await meRes.json();
  const trainerId = user.formateur?.id;

  if (!trainerId) {
    return { trainer: null };
  }

  const trainerRes = await fetch(`${API_URL}/trainers/${trainerId}`, {
    headers: { Cookie: `Authentication=${token}` },
    cache: 'no-store',
  })

  if (!trainerRes.ok) {
    return { trainer: null };
  }

  const trainer = await trainerRes.json();

  return { trainer };
}

export default async function TrainerProfilePage() {
  const { trainer } = await getData();

  if (!trainer) return (
    <div className="flex items-center justify-center min-h-[50vh] text-red-600 font-medium">
      Impossible de charger le profil.
    </div>
  );

  const initials = `${trainer.firstName[0]}${trainer.lastName[0]}`.toUpperCase();

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row items-center gap-8 mb-12">
        <div className="relative group">
          <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl group-hover:blur-3xl transition-all opacity-50"></div>
          <Avatar className="h-32 w-32 border-4 border-white shadow-xl relative z-10">
            <AvatarImage src={trainer.avatarUrl} />
            <AvatarFallback className="text-3xl font-black bg-gradient-to-br from-primary to-primary/80 text-white">
              {initials}
            </AvatarFallback>
          </Avatar>
        </div>

        <div className="text-center md:text-left space-y-2">
          <h1 className="text-4xl font-black tracking-tighter text-gray-900">
            {trainer.firstName} {trainer.lastName}
          </h1>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-muted-foreground font-medium">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              Formateur Actif
            </span>
            {trainer.address && (
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4" /> {trainer.address}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-8">
        <Card className="rounded-[2rem] border-border shadow-sm overflow-hidden">
          <CardContent className="p-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="h-12 w-12 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
                <User className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-black tracking-tight text-gray-900">Informations Personnelles</h2>
                <p className="text-muted-foreground text-sm font-medium">Gérez vos coordonnées et votre bio.</p>
              </div>
            </div>
            <ProfileForm trainer={trainer} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
