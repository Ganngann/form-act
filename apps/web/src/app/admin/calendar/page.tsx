import { MasterCalendar } from "@/components/admin/master-calendar";

export default function CalendarPage() {
  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <span className="inline-block px-3 py-1 rounded-md bg-blue-50 border border-blue-200 text-[10px] font-black uppercase tracking-widest text-blue-600 mb-4">
            Planification
          </span>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-gray-900 mb-2">
            Master Calendar
          </h1>
          <p className="text-muted-foreground font-medium text-lg max-w-2xl">
            Visualisez les disponibilités et gérez l&apos;affectation des formateurs en temps réel.
          </p>
        </div>
      </div>
      <MasterCalendar />
    </div>
  );
}
