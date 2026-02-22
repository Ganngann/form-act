import { FormationForm } from '@/components/admin/FormationForm';
import { API_URL } from '@/lib/config';
import { AdminHeader } from '@/components/admin/AdminHeader';

async function getData() {
    const [catsRes, trainersRes] = await Promise.all([
        fetch(`${API_URL}/categories`, { cache: 'no-store' }),
        fetch(`${API_URL}/admin/trainers?take=1000`, { cache: 'no-store' })
    ]);

    const categories = await catsRes.json();
    const trainersData = await trainersRes.json();

    return {
        categories,
        trainers: trainersData.data || []
    };
}

export default async function NewFormationPage() {
    const { categories, trainers } = await getData();

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-20 px-4 md:px-8 w-full">
            <AdminHeader
                backLink="/admin/formations"
                breadcrumbs={[
                    { label: "Admin", href: "/admin" },
                    { label: "Formations", href: "/admin/formations" },
                    { label: "Nouvelle" }
                ]}
                badge="Catalogue"
                badgeClassName="bg-emerald-50 border-emerald-200 text-emerald-600"
                title="Nouvelle Formation"
                description="Créez un nouveau module de formation et configurez ses modalités."
            />

            <div className="w-full">
                <FormationForm categories={categories} trainers={trainers} />
            </div>
        </div>
    );
}
