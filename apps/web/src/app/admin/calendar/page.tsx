import { MasterCalendar } from "@/components/admin/master-calendar";

export default function CalendarPage() {
  return (
    <div className="space-y-4 overflow-hidden">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Master Calendar</h2>
      </div>
      <MasterCalendar />
    </div>
  );
}
