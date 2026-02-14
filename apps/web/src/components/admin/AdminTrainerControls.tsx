"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { API_URL } from "@/lib/config";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Pencil, Trash2, UserCog, ShieldAlert } from "lucide-react";
import Link from "next/link";

interface Trainer {
    id: string;
    firstName: string;
    lastName: string;
}

export function AdminTrainerControls({ trainer }: { trainer: Trainer }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        if (!confirm("Êtes-vous sûr de vouloir supprimer ce formateur ? Cette action est irréversible.")) return;

        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/admin/trainers/${trainer.id}`, {
                method: "DELETE",
                credentials: "include"
            });
            if (!res.ok) throw new Error("Delete failed");
            router.push("/admin/trainers");
            router.refresh();
        } catch (e) {
            alert("Erreur lors de la suppression");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <Card className="rounded-[2.5rem] border-none shadow-xl bg-white overflow-hidden">
                <CardHeader className="bg-gray-50/50 border-b border-gray-100/50 pb-4">
                    <CardTitle className="text-lg font-black text-gray-900 tracking-tight flex items-center gap-2">
                        <UserCog className="h-5 w-5 text-primary" /> Actions Profil
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 p-8 pt-6">
                    <Button asChild className="w-full rounded-xl font-bold h-12 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all">
                        <Link href={`/admin/trainers/${trainer.id}/edit`}>
                            <Pencil className="mr-2 h-4 w-4" /> Modifier les informations
                        </Link>
                    </Button>
                    <div className="text-[10px] font-bold text-slate-500 bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-start gap-3 italic">
                        <span>Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</span>
                    </div>
                </CardContent>
            </Card>

            <Card className="rounded-[2.5rem] border-none shadow-xl bg-white overflow-hidden border-2 border-red-50">
                <CardHeader className="bg-red-50/50 border-b border-red-100/50 pb-4">
                    <CardTitle className="text-lg font-black text-red-900 tracking-tight flex items-center gap-2">
                        <ShieldAlert className="h-5 w-5 text-red-600" /> Zone de danger
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-8 pt-6">
                    <Button
                        variant="ghost"
                        onClick={handleDelete}
                        disabled={loading}
                        className="w-full rounded-2xl font-black text-red-500 hover:text-red-600 hover:bg-red-50 h-14 border-2 border-transparent hover:border-red-100 transition-all uppercase tracking-widest text-[10px]"
                    >
                        Supprimer définitivement
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
