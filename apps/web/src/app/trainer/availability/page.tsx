import { cookies } from "next/headers";
import { API_URL } from "@/lib/config";
import { AvailabilityManager } from "@/components/trainer/availability-manager";
import { Calendar } from "lucide-react";

async function getTrainerId() {
    const cookieStore = cookies();
    const token = cookieStore.get("Authentication")?.value;
    if (!token) return null;

    try {
        const meRes = await fetch(`${API_URL}/auth/me`, {
            headers: { Cookie: `Authentication=${token}` },
            cache: "no-store",
        });
        if (!meRes.ok) return null;
        const user = await meRes.json();
        return user.formateur?.id || null;
    } catch (e) {
        console.error("Failed to fetch trainer info:", e);
        return null;
    }
}

export default async function TrainerAvailabilityPage() {
    const trainerId = await getTrainerId();

    if (!trainerId) {
        return (
            <div className="max-w-4xl mx-auto p-8 text-center bg-white border border-border rounded-[2rem] shadow-sm">
                <div className="h-16 w-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Calendar className="h-8 w-8" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Accès restreint</h2>
                <p className="text-muted-foreground mb-4">Vous devez être connecté en tant que formateur pour accéder à cette interface.</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row items-center gap-6 mb-8">
                <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-lg shadow-primary/5">
                    <Calendar className="h-10 w-10" />
                </div>
                <div>
                    <h1 className="text-4xl font-black tracking-tighter text-gray-900 mb-2">Mes Disponibilités</h1>
                    <p className="text-muted-foreground font-medium text-lg">Définissez vos jours de travail par défaut et gérez vos indisponibilités ponctuelles.</p>
                </div>
            </div>

            <div className="bg-white border border-border rounded-[2rem] p-8 shadow-sm">
                <AvailabilityManager trainerId={trainerId} />
            </div>
        </div>
    );
}
