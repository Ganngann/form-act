import Link from 'next/link';
import { MapPin, Calendar, Clock, User, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NextMissionCardProps {
  mission: any;
}

export function NextMissionCard({ mission }: NextMissionCardProps) {
  if (!mission) return null;

  let participantCount = 0;
  try {
    const participants = mission.participants ? JSON.parse(mission.participants) : [];
    participantCount = participants.length;
  } catch (e) {
    console.error('Failed to parse participants', e);
  }

  const address = mission.location || mission.client?.address || 'Adresse manquante';
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-xl shadow-lg p-6 mb-8">
      <div className="flex justify-between items-start mb-4">
        <div>
          <span className="inline-block bg-white/20 text-white text-xs font-semibold px-2 py-1 rounded mb-2">
            PROCHAINE MISSION
          </span>
          <h2 className="text-2xl font-bold">{mission.formation.title}</h2>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold">
            {new Date(mission.date).getDate()}
          </div>
          <div className="text-sm uppercase tracking-wide opacity-80">
            {new Date(mission.date).toLocaleDateString('fr-FR', { month: 'short' })}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div className="flex items-center gap-3">
          <User className="h-5 w-5 opacity-80" />
          <span className="font-medium">{mission.client?.companyName || 'Client Inconnu'}</span>
        </div>
        <div className="flex items-center gap-3">
          <Clock className="h-5 w-5 opacity-80" />
          <span>
            {mission.slot === 'AM' ? 'Matin (09:00 - 12:30)' :
              mission.slot === 'PM' ? 'Après-midi (13:30 - 17:00)' :
                'Journée (09:00 - 17:00)'}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Users className="h-5 w-5 opacity-80" />
          <span>{participantCount} participant{participantCount !== 1 ? 's' : ''}</span>
        </div>
        <div className="flex items-center gap-3">
          <MapPin className="h-5 w-5 opacity-80" />
          <span className="truncate">{address}</span>
        </div>
      </div>

      <div className="flex gap-3">
        <Button asChild variant="secondary" className="bg-white text-blue-800 hover:bg-gray-100">
          <a href={mapsUrl} target="_blank" rel="noopener noreferrer">
            Y aller (GPS)
          </a>
        </Button>
        <Button asChild variant="outline" className="bg-transparent border-white/30 text-white hover:bg-white/10 hover:text-white">
          <Link href={`/trainer/missions/${mission.id}`}>
            Détails & Documents
          </Link>
        </Button>
      </div>
    </div>
  );
}
