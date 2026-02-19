import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { API_URL } from '@/lib/config';
import { Plus, Users, Search } from 'lucide-react';
import { TrainerActions } from '@/components/admin/TrainerActions';
import { TrainerFilters } from '@/components/admin/TrainerFilters';
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

async function getTrainers(page: number = 0, search: string = '', includeInactive: boolean = false) {
  const res = await fetch(`${API_URL}/admin/trainers?skip=${page * 10}&take=10&search=${search}&includeInactive=${includeInactive}`, {
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Failed to fetch trainers');
  return res.json();
}

export default async function TrainersPage({
  searchParams,
}: {
  searchParams: { page?: string; q?: string; includeInactive?: string };
}) {
  const page = Number(searchParams.page) || 0;
  const search = searchParams.q || '';
  const includeInactive = searchParams.includeInactive === 'true';
  const { data: trainers, total } = await getTrainers(page, search, includeInactive);

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <span className="inline-block px-3 py-1 rounded-md bg-orange-50 border border-orange-200 text-[10px] font-black uppercase tracking-widest text-orange-600 mb-4">
            Ressources Humaines
          </span>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-gray-900 mb-2">
            Annuaire Formateurs
          </h1>
          <p className="text-muted-foreground font-medium text-lg max-w-2xl">
            Gérez votre équipe pédagogique, leurs disponibilités et leurs zones d&apos;expertise.
          </p>
        </div>
        <Link href="/admin/trainers/new">
          <Button className="rounded-xl font-bold h-12 px-8 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all">
            <Plus className="mr-2 h-5 w-5" />
            Nouveau Formateur
          </Button>
        </Link>
      </div>

      <Card className="border-none shadow-xl bg-white/50 backdrop-blur-sm rounded-[2.5rem] overflow-hidden">
        <TrainerFilters />

        <div className="p-0">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50/50 text-gray-600 uppercase text-xs tracking-wider font-bold">
              <tr>
                <th className="pl-8 py-4 h-14">Profil</th>
                <th className="py-4 h-14">Contact</th>
                <th className="py-4 h-14">Spécialité</th>
                <th className="py-4 h-14">Status</th>
                <th className="pr-8 py-4 h-14 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {trainers.map((trainer: any) => (
                <tr key={trainer.id} className="group hover:bg-blue-50/30 transition-colors">
                  <td className="pl-8 py-4 flex items-center gap-3">
                    <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                      <AvatarImage src={trainer.avatarUrl} />
                      <AvatarFallback className="font-bold text-primary bg-primary/10">
                        {trainer.firstName[0]}{trainer.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-bold text-gray-900 group-hover:text-primary transition-colors">{trainer.firstName} {trainer.lastName}</p>
                      <p className="text-xs text-muted-foreground font-medium">ID: {trainer.id.slice(0, 8)}</p>
                    </div>
                  </td>
                  <td className="py-4 font-medium text-gray-600">
                    {trainer.email}
                    {trainer.phone && <div className="text-xs text-muted-foreground mt-0.5">{trainer.phone}</div>}
                  </td>
                  <td className="py-4">
                    {trainer.speciality ? (
                      <Badge variant="outline" className="rounded-lg font-medium border-blue-200 text-blue-700 bg-blue-50">{trainer.speciality}</Badge>
                    ) : (
                      <span className="text-muted-foreground text-xs italic">Non renseigné</span>
                    )}
                  </td>
                  <td className="py-4">
                    <div className="flex items-center gap-1.5">
                      <div className={`h-2 w-2 rounded-full ${trainer.isActive ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 'bg-gray-400'}`} />
                      <span className={`text-xs font-bold ${trainer.isActive ? 'text-green-700' : 'text-gray-500'}`}>
                        {trainer.isActive ? 'Actif' : 'Inactif'}
                      </span>
                    </div>
                  </td>
                  <td className="pr-8 py-4 text-right">
                    <TrainerActions trainerId={trainer.id} isActive={trainer.isActive} />
                  </td>
                </tr>
              ))}
              {trainers.length === 0 && (
                <tr>
                  <td colSpan={5} className="h-32 text-center text-muted-foreground font-medium">
                    Aucun formateur trouvé.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="flex items-center justify-between pt-4">
        <p className="text-sm text-muted-foreground font-medium pl-2">
          Affichage {trainers.length} sur {total} résultats
        </p>
        <div className="flex gap-2">
          {page > 0 && (
            <Link href={`/admin/trainers?page=${page - 1}&q=${search}&includeInactive=${includeInactive}`}>
              <Button variant="outline" className="rounded-xl font-bold">Précédent</Button>
            </Link>
          )}
          {(page + 1) * 10 < total && (
            <Link href={`/admin/trainers?page=${page + 1}&q=${search}&includeInactive=${includeInactive}`}>
              <Button variant="outline" className="rounded-xl font-bold">Suivant</Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
