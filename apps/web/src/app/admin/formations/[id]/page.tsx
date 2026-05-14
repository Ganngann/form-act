import { FormationForm } from '@/components/admin/FormationForm';
import { API_URL } from '@/lib/config';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AdminHeader } from '@/components/admin/AdminHeader';

async function getFormation(id: string) {
    const cookieStore = cookies();
    const token = cookieStore.get('Authentication')?.value;

    const res = await fetch(`${API_URL}/formations/${id}`, {
        headers: token ? { Cookie: `Authentication=${token}` } : {},
        cache: 'no-store',
    });
    if (!res.ok) throw new Error('Failed to fetch formation');
    return res.json();
}

async function getMetadata() {
    const cookieStore = cookies();
    const token = cookieStore.get('Authentication')?.value;
    const headers = token ? { Cookie: `Authentication=${token}` } : {};

    const [catsRes, trainersRes] = await Promise.all([
        fetch(`${API_URL}/categories`, { headers, cache: 'no-store' }),
        fetch(`${API_URL}/admin/trainers?take=1000`, { headers, cache: 'no-store' })
    ]);

    const categories = await catsRes.json();
    const trainersData = await trainersRes.json();

    return {
        categories,
        trainers: trainersData.data || []
    };
}

export default async function EditFormationPage({ params }: { params: { id: string } }) {
    const [formation, metadata] = await Promise.all([
        getFormation(params.id),
        getMetadata()
    ]);

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-20 px-4 md:px-8 w-full">
            <AdminHeader
                backLink="/admin/formations"
                breadcrumbs={[
                    { label: "Admin", href: "/admin" },
                    { label: "Formations", href: "/admin/formations" },
                    { label: "Modifier" }
                ]}
                badge="Configuration Module"
                badgeClassName="bg-indigo-50 border-indigo-200 text-indigo-600"
                title={formation.title}
                description="Mettez à jour les contenus, tarifs et habilitations de ce module."
            />

            <div className="w-full">
                <FormationForm
                    initialData={formation}
                    categories={metadata.categories}
                    trainers={metadata.trainers}
                    isEdit
                />
            </div>
        </div>
    );
}
