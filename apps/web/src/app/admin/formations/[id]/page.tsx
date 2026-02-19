import { FormationForm } from '@/components/admin/FormationForm';
import { API_URL } from '@/lib/config';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

async function getFormation(id: string) {
    const res = await fetch(`${API_URL}/formations/${id}`, {
        cache: 'no-store',
    });
    if (!res.ok) throw new Error('Failed to fetch formation');
    return res.json();
}

async function getMetadata() {
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

export default async function EditFormationPage({ params }: { params: { id: string } }) {
    const [formation, metadata] = await Promise.all([
        getFormation(params.id),
        getMetadata()
    ]);

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-20 px-4 md:px-8 w-full">
            {/* Header with Breadcrumb */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                    <Link href="/admin" className="hover:text-primary transition-colors">Admin</Link>
                    <span>/</span>
                    <Link href="/admin/formations" className="hover:text-primary transition-colors">Formations</Link>
                    <span>/</span>
                    <span className="text-gray-900">Modifier</span>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                    <div className="flex items-center gap-6">
                        <Button variant="outline" size="icon" asChild className="rounded-xl h-10 w-10 border-border bg-white shadow-sm shrink-0">
                            <Link href="/admin/formations">
                                <ArrowLeft className="h-5 w-5" />
                            </Link>
                        </Button>
                        <div>
                            <span className="inline-block px-3 py-1 rounded-md bg-indigo-50 border border-indigo-200 text-[10px] font-black uppercase tracking-widest text-indigo-600 mb-4">
                                Configuration Module
                            </span>
                            <h1 className="text-3xl font-black tracking-tight text-gray-900">
                                {formation.title}
                            </h1>
                            <p className="text-muted-foreground font-medium text-sm mt-1">
                                Mettez à jour les contenus, tarifs et habilitations de ce module.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

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
