import { TrainerForm } from '@/components/admin/TrainerForm';
import { API_URL } from '@/lib/config';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AdminHeader } from '@/components/admin/AdminHeader';

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
        <div className="space-y-8 max-w-7xl mx-auto pb-20 px-4 md:px-8 w-full">
            <AdminHeader
                backLink={`/admin/trainers/${params.id}`}
                breadcrumbs={[
                    { label: "Admin", href: "/admin" },
                    { label: "Formateurs", href: "/admin/trainers" },
                    { label: "Détail", href: `/admin/trainers/${params.id}` },
                    { label: "Modifier" }
                ]}
                badge="Configuration"
                badgeClassName="bg-blue-50 border-blue-200 text-blue-600"
                title="Modifier le profil"
                description={`Mettez à jour les informations de ${trainer.firstName} ${trainer.lastName}.`}
            />

            <div className="w-full">
                <TrainerForm initialData={trainer} isEdit />
            </div>
        </div>
    );
}
