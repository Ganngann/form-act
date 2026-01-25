import { cookies } from 'next/headers';
import { API_URL } from '@/lib/config';
import { FormationsTable } from '@/components/admin/FormationsTable';

async function getData() {
  const cookieStore = cookies();
  const token = cookieStore.get('Authentication')?.value;
  const headers = { Cookie: `Authentication=${token}` };

  const [formationsRes, categoriesRes, expertisesRes] = await Promise.all([
    fetch(`${API_URL}/admin/formations`, { headers, cache: 'no-store' }),
    fetch(`${API_URL}/categories`, { headers, cache: 'no-store' }),
    fetch(`${API_URL}/expertises`, { headers, cache: 'no-store' }),
  ]);

  if (!formationsRes.ok) {
     console.error("Failed to fetch formations", await formationsRes.text());
     return { formations: [], categories: [], expertises: [] };
  }

  const formations = await formationsRes.json();
  const categories = await categoriesRes.json();
  const expertises = await expertisesRes.json();

  return { formations, categories, expertises };
}

export default async function AdminFormationsPage() {
  const { formations, categories, expertises } = await getData();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Gestion des Formations</h1>
      <FormationsTable
        initialFormations={formations}
        categories={categories}
        expertises={expertises}
      />
    </div>
  );
}
