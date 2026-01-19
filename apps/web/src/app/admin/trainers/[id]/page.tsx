import { TrainerForm } from '@/components/admin/TrainerForm';
import { API_URL } from '@/lib/config';

async function getTrainer(id: string) {
  const res = await fetch(`${API_URL}/admin/trainers/${id}`, {
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Failed to fetch trainer');
  return res.json();
}

export default async function EditTrainerPage({ params }: { params: { id: string } }) {
  const trainer = await getTrainer(params.id);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-semibold md:text-2xl">Modifier le formateur</h1>
      <TrainerForm initialData={trainer} isEdit />
    </div>
  );
}
