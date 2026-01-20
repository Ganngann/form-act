import { LogoutButton } from '@/components/LogoutButton';

export default function AdminDashboard() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">Bienvenue dans l&apos;espace administrateur.</p>
        </div>
        <LogoutButton />
      </div>
    </div>
  );
}
