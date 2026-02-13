import { TrainerForm } from "@/components/admin/TrainerForm";

export default function NewTrainerPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-semibold md:text-2xl">
        Ajouter un formateur
      </h1>
      <TrainerForm />
    </div>
  );
}
