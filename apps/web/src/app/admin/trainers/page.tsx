import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { API_URL } from '@/lib/config';
import { Plus, Pencil } from 'lucide-react';
import { DeleteTrainerButton } from '@/components/admin/DeleteTrainerButton';

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
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold md:text-2xl">Formateurs</h1>
        <Link href="/admin/trainers/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Ajouter
          </Button>
        </Link>
      </div>

      <div className="flex items-center gap-2">
         <form className="flex gap-2 w-full md:w-auto">
           <Input name="q" placeholder="Rechercher..." defaultValue={search} className="max-w-xs" />
           <Button type="submit" variant="secondary">Rechercher</Button>
         </form>
      </div>

      <div className="rounded-md border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50 text-left hover:bg-muted/50">
              <th className="p-4 font-medium">Nom</th>
              <th className="p-4 font-medium">Email</th>
              <th className="p-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {trainers.map((trainer: any) => (
              <tr key={trainer.id} className="border-b hover:bg-muted/50">
                <td className="p-4">{trainer.firstName} {trainer.lastName}</td>
                <td className="p-4">{trainer.email}</td>
                <td className="p-4 flex gap-2">
                   <Link href={`/admin/trainers/${trainer.id}`}>
                     <Button size="icon" variant="ghost">
                        <Pencil className="h-4 w-4" />
                     </Button>
                   </Link>
                   <DeleteTrainerButton id={trainer.id} />
                </td>
              </tr>
            ))}
            {trainers.length === 0 && (
                <tr>
                    <td colSpan={3} className="p-4 text-center text-muted-foreground">Aucun formateur trouvé.</td>
                </tr>
            )}
          </tbody>
        </table>
      </div>

       <div className="flex items-center gap-2 justify-end">
          {page > 0 && (
            <Link href={`/admin/trainers?page=${page - 1}&q=${search}`}>
              <Button variant="outline">Précédent</Button>
            </Link>
          )}
          {(page + 1) * 10 < total && (
            <Link href={`/admin/trainers?page=${page + 1}&q=${search}`}>
               <Button variant="outline">Suivant</Button>
            </Link>
          )}
       </div>
    </div>
  );
}
