import { MasterCalendar } from "@/components/admin/master-calendar";
import { AdminHeader } from "@/components/admin/AdminHeader";

export default function CalendarPage() {
  return (
    <div className="space-y-12">
      <AdminHeader
        badge="Planification"
        badgeClassName="bg-blue-50 border-blue-200 text-blue-600"
        title="Master Calendar"
        description="Visualisez les disponibilités et gérez l'affectation des formateurs en temps réel."
      />
      <MasterCalendar />
    </div>
  );
}
