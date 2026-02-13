import { Sidebar } from "@/components/dashboard/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="container flex min-h-[calc(100vh-100px)] py-10 gap-10">
      <Sidebar />
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
