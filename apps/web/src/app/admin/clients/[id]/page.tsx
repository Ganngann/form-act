"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { API_URL } from "@/lib/config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ChevronLeft, Save, Edit2, History, Briefcase } from "lucide-react";
import Link from "next/link";
import { StatusBadge } from "@/components/ui/status-badge";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface ClientDetail {
    id: string;
    vatNumber: string;
    companyName: string;
    address: string;
    auditLog: string | null;
    createdAt: string;
    user: {
        email: string;
    };
    sessions: any[];
}

interface AuditEntry {
    date: string;
    by: string;
    changes: { field: string; old: string; new: string }[];
}

export default function AdminClientDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [client, setClient] = useState<ClientDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        companyName: "",
        vatNumber: "",
        address: "",
        email: "",
    });

    useEffect(() => {
        fetchClient();
    }, [id]);

    const fetchClient = async () => {
        try {
            const res = await fetch(`${API_URL}/clients/${id}`, { credentials: "include" });
            if (!res.ok) throw new Error("Client introuvable");
            const data = await res.json();
            setClient(data);
            setFormData({
                companyName: data.companyName,
                vatNumber: data.vatNumber,
                address: data.address,
                email: data.user.email,
            });
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError("");

        try {
            const res = await fetch(`${API_URL}/clients/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
                credentials: "include",
            });

            if (!res.ok) throw new Error("Erreur lors de la sauvegarde");

            setIsEditing(false);
            fetchClient();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8">Chargement...</div>;
    if (error || !client) return <div className="p-8 text-red-500">Erreur: {error}</div>;

    const auditLogs: AuditEntry[] = client.auditLog ? JSON.parse(client.auditLog) : [];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/admin/clients">
                            <ChevronLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <h1 className="text-2xl font-bold">{client.companyName}</h1>
                </div>
                <Button onClick={() => setIsEditing(!isEditing)} variant={isEditing ? "outline" : "default"}>
                    {isEditing ? "Annuler" : <><Edit2 className="h-4 w-4 mr-2" /> Modifier</>}
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Informations Principales */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Profil Client</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSave} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Nom de l&apos;entreprise</label>
                                        <Input
                                            value={formData.companyName}
                                            disabled={!isEditing}
                                            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Numéro de TVA</label>
                                        <Input
                                            value={formData.vatNumber}
                                            disabled={!isEditing}
                                            onChange={(e) => setFormData({ ...formData, vatNumber: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Adresse</label>
                                    <Input
                                        value={formData.address}
                                        disabled={!isEditing}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Email de contact (Utilisateur)</label>
                                    <Input
                                        type="email"
                                        value={formData.email}
                                        disabled={!isEditing}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        required
                                    />
                                </div>

                                {isEditing && (
                                    <div className="pt-4">
                                        <Button type="submit" disabled={saving}>
                                            {saving ? "Enregistrement..." : <><Save className="h-4 w-4 mr-2" /> Enregistrer</>}
                                        </Button>
                                    </div>
                                )}
                            </form>
                        </CardContent>
                    </Card>

                    {/* Sessions du client */}
                    <Card>
                        <CardHeader className="flex flex-row items-center gap-2">
                            <Briefcase className="h-5 w-5 text-muted-foreground" />
                            <CardTitle>Historique des Formations</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {client.sessions.length === 0 ? (
                                <p className="text-sm text-muted-foreground">Aucune session enregistrée pour ce client.</p>
                            ) : (
                                <div className="space-y-4">
                                    {client.sessions.map((session: any) => (
                                        <Link
                                            key={session.id}
                                            href={`/admin/sessions/${session.id}`}
                                            className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors"
                                        >
                                            <div className="space-y-1">
                                                <p className="font-semibold text-slate-900">{session.formation.title}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {format(new Date(session.date), "d MMMM yyyy", { locale: fr })} • {session.slot}
                                                </p>
                                                {session.trainer && (
                                                    <p className="text-xs text-muted-foreground">
                                                        Formateur: {session.trainer.firstName} {session.trainer.lastName}
                                                    </p>
                                                )}
                                            </div>
                                            <StatusBadge status={session.status} />
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Audit Log Vertical */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center gap-2">
                            <History className="h-5 w-5 text-muted-foreground" />
                            <CardTitle>Modifications</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {auditLogs.length === 0 ? (
                                <p className="text-sm text-muted-foreground">Aucun historique de modification.</p>
                            ) : (
                                <div className="space-y-6">
                                    {auditLogs.map((entry, i) => (
                                        <div key={i} className="relative pl-4 border-l-2 border-slate-100 last:border-0 pb-4">
                                            <div className="absolute -left-[5px] top-1 h-2 w-2 rounded-full bg-slate-300" />
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                                {format(new Date(entry.date), "d MMM yyyy, HH:mm", { locale: fr })}
                                            </p>
                                            <p className="text-xs font-semibold text-slate-600 mb-2">
                                                Par {entry.by}
                                            </p>
                                            <ul className="space-y-1.5">
                                                {entry.changes.map((change, j) => (
                                                    <li key={j} className="text-xs text-slate-500">
                                                        <span className="font-medium text-slate-700">{change.field}</span>:{" "}
                                                        <span className="line-through opacity-50">{change.old}</span> →{" "}
                                                        <span className="text-blue-600">{change.new}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
