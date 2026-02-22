import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { API_URL } from '@/lib/config';
import { Plus, Users, Search } from 'lucide-react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { TrainerActions } from '@/components/admin/TrainerActions';
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

async function getTrainers(page: number = 0, search: string = '') {
  const res = await fetch(`${API_URL}/admin/trainers?skip=${page * 10}&take=10&search=${search}`, {
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Failed to fetch trainers');
  return res.json();
}

export default async function TrainersPage({
  searchParams,
}: {
  searchParams: { page?: string; q?: string };
}) {
  const page = Number(searchParams.page) || 0;
  const search = searchParams.q || '';
  const { data: trainers, total } = await getTrainers(page, search);

  return (
    <div className="space-y-12">
      <AdminHeader
        badge="Ressources Humaines"
        badgeClassName="bg-orange-50 border-orange-200 text-orange-600"
        title="Annuaire Formateurs"
        description="Gérez votre équipe pédagogique, leurs disponibilités et leurs zones d'expertise."
      >
        <Link href="/admin/trainers/new">
          <Button className="rounded-xl font-bold h-12 px-8 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all">
            <Plus className="mr-2 h-5 w-5" />
            Nouveau Formateur
          </Button>
        </Link>
      </AdminHeader>

      <Card className="border-none shadow-xl bg-white/50 backdrop-blur-sm rounded-[2.5rem] overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <form className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              name="q"
              placeholder="Rechercher un formateur..."
              defaultValue={search}
              className="pl-10 h-11 rounded-xl bg-white border-transparent shadow-sm focus-visible:ring-primary/20 font-medium"
            />
          </form>
        </div>

        <div className="p-0">
          <Table>
            <TableHeader className="bg-gray-50/50">
              <TableRow className="hover:bg-transparent border-gray-100">
                <TableHead className="pl-8 h-14 font-bold text-gray-600 uppercase text-xs tracking-wider">Profil</TableHead>
                <TableHead className="h-14 font-bold text-gray-600 uppercase text-xs tracking-wider">Contact</TableHead>
                <TableHead className="h-14 font-bold text-gray-600 uppercase text-xs tracking-wider">Spécialité</TableHead>
                <TableHead className="h-14 font-bold text-gray-600 uppercase text-xs tracking-wider">Status</TableHead>
                <TableHead className="pr-8 h-14 font-bold text-gray-600 uppercase text-xs tracking-wider text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trainers.map((trainer: any) => (
                <TableRow key={trainer.id} className="group hover:bg-blue-50/30 border-gray-100 transition-colors">
                  <TableCell className="pl-8 py-4">
                    <div className="flex items-center gap-3">
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
                    </div>
                  </TableCell>
                  <TableCell className="py-4 font-medium text-gray-600">
                    {trainer.email}
                    {trainer.phone && <div className="text-xs text-muted-foreground mt-0.5">{trainer.phone}</div>}
                  </TableCell>
                  <TableCell className="py-4">
                    {trainer.speciality ? (
                      <Badge variant="outline" className="rounded-lg font-medium border-blue-200 text-blue-700 bg-blue-50">{trainer.speciality}</Badge>
                    ) : (
                      <span className="text-muted-foreground text-xs italic">Non renseigné</span>
                    )}
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex items-center gap-1.5">
                      <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
                      <span className="text-xs font-bold text-green-700">Actif</span>
                    </div>
                  </TableCell>
                  <TableCell className="pr-8 py-4 text-right">
                    <TrainerActions trainerId={trainer.id} />
                  </TableCell>
                </TableRow>
              ))}
              {trainers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-muted-foreground font-medium">
                    Aucun formateur trouvé.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <div className="flex items-center justify-between pt-4">
        <p className="text-sm text-muted-foreground font-medium pl-2">
          Affichage {trainers.length} sur {total} résultats
        </p>
        <div className="flex gap-2">
          {page > 0 && (
            <Link href={`/admin/trainers?page=${page - 1}&q=${search}`}>
              <Button variant="outline" className="rounded-xl font-bold">Précédent</Button>
            </Link>
          )}
          {(page + 1) * 10 < total && (
            <Link href={`/admin/trainers?page=${page + 1}&q=${search}`}>
              <Button variant="outline" className="rounded-xl font-bold">Suivant</Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
