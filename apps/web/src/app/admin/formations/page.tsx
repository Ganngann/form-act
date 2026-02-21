import { cookies } from 'next/headers';
import { API_URL } from '@/lib/config';
import { FormationsTable } from '@/components/admin/FormationsTable';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { AdminHeader } from '@/components/admin/AdminHeader';

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
    <div className="space-y-12">
      <AdminHeader
        badge="Catalogue"
        badgeClassName="bg-emerald-50 border-emerald-200 text-emerald-600"
        title="Catalogue Formations"
        description="Pilotez votre offre pédagogique et les tarifs associés à vos programmes."
      >
        <Link href="/admin/formations/new">
          <Button className="rounded-xl font-bold h-12 px-8 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all">
            <Plus className="mr-2 h-5 w-5" />
            Nouveau Module
          </Button>
        </Link>
      </AdminHeader>

      <FormationsTable
        initialFormations={formations}
        categories={categories}
        trainers={trainers}
      />
    </div>
  );
}
