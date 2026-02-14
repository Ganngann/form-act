import { TrainerForm } from '@/components/admin/TrainerForm';
import { API_URL } from '@/lib/config';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
            {/* Header with Breadcrumb */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                    <Link href="/admin" className="hover:text-primary transition-colors">Admin</Link>
                    <span>/</span>
                    <Link href="/admin/trainers" className="hover:text-primary transition-colors">Formateurs</Link>
                    <span>/</span>
                    <Link href={`/admin/trainers/${params.id}`} className="hover:text-primary transition-colors">Détail</Link>
                    <span>/</span>
                    <span className="text-gray-900">Modifier</span>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                    <div className="flex items-center gap-6">
                        <Button variant="outline" size="icon" asChild className="rounded-xl h-10 w-10 border-border bg-white shadow-sm shrink-0">
                            <Link href={`/admin/trainers/${params.id}`}>
                                <ArrowLeft className="h-5 w-5" />
                            </Link>
                        </Button>
                        <div>
                            <span className="inline-block px-3 py-1 rounded-md bg-blue-50 border border-blue-200 text-[10px] font-black uppercase tracking-widest text-blue-600 mb-4">
                                Configuration
                            </span>
                            <h1 className="text-3xl font-black tracking-tight text-gray-900">
                                Modifier le profil
                            </h1>
                            <p className="text-muted-foreground font-medium text-sm mt-1">
                                Mettez à jour les informations de {trainer.firstName} {trainer.lastName}.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="w-full">
                <TrainerForm initialData={trainer} isEdit />
            </div>
        </div>
    );
}
