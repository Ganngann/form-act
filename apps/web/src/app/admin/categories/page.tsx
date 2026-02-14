import { cookies } from 'next/headers';
import { API_URL } from '@/lib/config';
import { CategoriesTable } from '@/components/admin/CategoriesTable';

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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <span className="inline-block px-3 py-1 rounded-md bg-primary/5 border border-primary/20 text-[10px] font-black uppercase tracking-widest text-primary mb-4">
            Configuration
          </span>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-gray-900 mb-2">
            Référentiel Thématique
          </h1>
          <p className="text-muted-foreground font-medium text-lg max-w-2xl">
            Gérez les thématiques de formation et l&apos;organisation de votre catalogue.
          </p>
        </div>
      </div>
      <CategoriesTable initialCategories={categories} />
    </div>
  );
}
