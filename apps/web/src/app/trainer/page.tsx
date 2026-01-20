import { LogoutButton } from '@/components/LogoutButton';

export default function TrainerPage() {
    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-4">Espace Formateur</h1>
            <p className="mb-4">Bienvenue dans votre espace dédié.</p>
            <LogoutButton />
        </div>
    );
}
