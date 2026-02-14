import { FormationForm } from '@/components/admin/FormationForm';
import { API_URL } from '@/lib/config';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

async function getData() {
    const [catsRes, trainersRes] = await Promise.all([
        fetch(`${API_URL}/categories`, { cache: 'no-store' }),
        fetch(`${API_URL}/admin/trainers`, { cache: 'no-store' }) // Trainers list for selection
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
            {/* Header with Breadcrumb */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                    <Link href="/admin" className="hover:text-primary transition-colors">Admin</Link>
                    <span>/</span>
                    <Link href="/admin/formations" className="hover:text-primary transition-colors">Formations</Link>
                    <span>/</span>
                    <span className="text-gray-900">Nouvelle</span>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="icon" asChild className="rounded-xl h-10 w-10 border-border bg-white shadow-sm shrink-0">
                            <Link href="/admin/formations">
                                <ArrowLeft className="h-5 w-5" />
                            </Link>
                        </Button>
                        <div>
                            <span className="inline-block px-3 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-4">
                                Catalogue
                            </span>
                            <h1 className="text-3xl font-black tracking-tight text-gray-900">
                                Nouvelle Formation
                            </h1>
                            <p className="text-muted-foreground font-medium text-sm mt-1">
                                Créez un nouveau module de formation et configurez ses modalités.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="w-full">
                <FormationForm categories={categories} trainers={trainers} />
            </div>
        </div>
    );
}
