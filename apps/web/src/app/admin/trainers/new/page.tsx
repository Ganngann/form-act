import { TrainerForm } from '@/components/admin/TrainerForm';
import Link from 'next/link';
import { AdminHeader } from '@/components/admin/AdminHeader';

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

        <AdminHeader
          backLink="/admin/trainers"
          badge="Ressources Humaines"
          badgeClassName="bg-orange-50 border-orange-200 text-orange-600"
          title="Nouveau Formateur"
          description="Enregistrez un nouveau collaborateur et définissez ses zones d'intervention."
        />
      </div>

      <div className="max-w-7xl">
        <TrainerForm />
      </div>
    </div>
  );
}
