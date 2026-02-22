import { TrainerForm } from '@/components/admin/TrainerForm';
import { AdminHeader } from '@/components/admin/AdminHeader';

export default function NewTrainerPage() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-20 px-4 md:px-8 w-full">
      <AdminHeader
        backLink="/admin/trainers"
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Formateurs", href: "/admin/trainers" },
          { label: "Nouveau" }
        ]}
        badge="Ressources Humaines"
        badgeClassName="bg-orange-50 border-orange-200 text-orange-600"
        title="Nouveau Formateur"
        description="Enregistrez un nouveau collaborateur et définissez ses zones d'intervention."
      />

      <div className="max-w-7xl">
        <TrainerForm />
      </div>
    </div>
  );
}
