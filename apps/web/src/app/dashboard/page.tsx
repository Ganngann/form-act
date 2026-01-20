import { LogoutButton } from '@/components/LogoutButton';

export default function ClientDashboard() {
    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-4">Espace Client</h1>
            <p className="mb-4">Bienvenue dans votre tableau de bord.</p>
            <LogoutButton />
        </div>
    );
}
