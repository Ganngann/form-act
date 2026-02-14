import { TrainerForm } from '@/components/admin/TrainerForm';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NewTrainerPage() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-20 px-4 md:px-8 w-full">
      {/* Header with Breadcrumb */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
          <Link href="/admin" className="hover:text-primary transition-colors">Admin</Link>
          <span>/</span>
          <Link href="/admin/trainers" className="hover:text-primary transition-colors">Formateurs</Link>
          <span>/</span>
          <span className="text-gray-900">Nouveau</span>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" asChild className="rounded-xl h-10 w-10 border-border bg-white shadow-sm shrink-0">
              <Link href="/admin/trainers">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <span className="inline-block px-3 py-1 rounded-md bg-orange-50 border border-orange-200 text-[10px] font-black uppercase tracking-widest text-orange-600 mb-4">
                Ressources Humaines
              </span>
              <h1 className="text-3xl font-black tracking-tight text-gray-900">
                Nouveau Formateur
              </h1>
              <p className="text-muted-foreground font-medium text-sm mt-1">
                Enregistrez un nouveau collaborateur et définissez ses zones d&apos;intervention.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl">
        <TrainerForm />
      </div>
    </div>
  );
}
