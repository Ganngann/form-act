import { cookies } from 'next/headers';
import { API_URL } from '@/lib/config';
import { FormationsTable } from '@/components/admin/FormationsTable';

async function getData() {
  const cookieStore = cookies();
  const token = cookieStore.get('Authentication')?.value;
  const headers = { Cookie: `Authentication=${token}` };

  const [formationsRes, categoriesRes, trainersRes] = await Promise.all([
    fetch(`${API_URL}/admin/formations`, { headers, cache: 'no-store' }),
    fetch(`${API_URL}/categories`, { headers, cache: 'no-store' }),
    fetch(`${API_URL}/admin/trainers?take=1000`, { headers, cache: 'no-store' }),
  ]);

  if (!formationsRes.ok) {
    throw new Error(`Failed to fetch formations: ${formationsRes.statusText}`);
  }

  const formations = await formationsRes.json();
  const categories = await categoriesRes.json();
  const trainersData = await trainersRes.json();

  return { formations, categories, trainers: trainersData.data || [] };
}

export default async function AdminFormationsPage() {
  const { formations, categories, trainers } = await getData();

  return (
    <div className="space-y-6">
      <FormationsTable
        initialFormations={formations}
        categories={categories}
        trainers={trainers}
      />
    </div>
  );
}
