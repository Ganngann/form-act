import { cookies } from 'next/headers';
import { API_URL } from '@/lib/config';
import { CategoriesTable } from '@/components/admin/CategoriesTable';
import { AdminHeader } from '@/components/admin/AdminHeader';

async function getCategories() {
  const cookieStore = cookies();
  const token = cookieStore.get('Authentication')?.value;
  const headers = { Cookie: `Authentication=${token}` };

  const res = await fetch(`${API_URL}/categories`, { headers, cache: 'no-store' });

  if (!res.ok) {
    throw new Error(`Failed to fetch categories: ${res.statusText}`);
  }

  return res.json();
}

export default async function AdminCategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="space-y-12">
      <AdminHeader
        badge="Configuration"
        badgeClassName="bg-primary/5 border-primary/20 text-primary"
        title="Référentiel Thématique"
        description="Gérez les thématiques de formation et l'organisation de votre catalogue."
      />
      <CategoriesTable initialCategories={categories} />
    </div>
  );
}
