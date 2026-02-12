"use client";

import { useEffect, useState } from "react";
import { API_URL } from "@/lib/config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, CreditCard, History, User } from "lucide-react";

interface ClientProfile {
    id: string;
    vatNumber: string;
    companyName: string;
    address: string;
    auditLog: string | null;
    user: {
        email: string;
    };
}

interface Change {
    field: string;
    old: string;
    new: string;
}

interface AuditEntry {
    date: string;
    by: string;
    changes: Change[];
}

export default function SettingsPage() {
    const [profile, setProfile] = useState<ClientProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [formData, setFormData] = useState({
        companyName: "",
        vatNumber: "",
        address: "",
        email: "",
    });

    const [loadingVat, setLoadingVat] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await fetch(`${API_URL}/clients/me`, { credentials: "include" });
            if (!res.ok) throw new Error("Impossible de charger le profil");
            const data = await res.json();
            setProfile(data);
            setFormData({
                companyName: data.companyName,
                vatNumber: data.vatNumber,
                address: data.address,
                email: data.user.email,
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erreur");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const checkVat = async () => {
        const vat = formData.vatNumber;
        if (!vat || vat.length < 4) return;

        setLoadingVat(true);
        setError("");
        setSuccess("");
        try {
            const res = await fetch(`${API_URL}/company/check-vat/${vat}`);
            if (!res.ok) throw new Error("Erreur vérification TVA");
            const data = await res.json();

            if (data.isValid) {
                setFormData({
                    ...formData,
                    companyName: data.companyName,
                    address: data.address,
                    vatNumber: data.vatNumber
                });
            } else {
                setError("Numéro de TVA non valide ou non trouvé.");
            }
        } catch (e) {
            console.error(e);
            setError("Impossible de vérifier le numéro de TVA.");
        } finally {
            setLoadingVat(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError("");
        setSuccess("");

        try {
            const res = await fetch(`${API_URL}/clients/me`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
                credentials: "include",
            });

            if (!res.ok) throw new Error("Erreur lors de la mise à jour");

            setSuccess("Paramètres mis à jour avec succès");
            fetchProfile();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erreur");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <p className="text-muted-foreground animate-pulse font-bold">Chargement de vos paramètres...</p>
            </div>
        )
    }

    const auditLogs: AuditEntry[] = profile?.auditLog ? JSON.parse(profile.auditLog) : [];

    return (
        <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col gap-2">
                <h1 className="text-4xl font-bold tracking-tight">Paramètres.</h1>
                <p className="text-muted-foreground font-medium">Gérez vos informations professionnelles et vos préférences.</p>
            </div>

            <Tabs defaultValue="billing" className="w-full">
                <TabsList className="bg-transparent border-b border-border rounded-none h-auto p-0 gap-8 mb-8">
                    <TabsTrigger
                        value="billing"
                        className="bg-transparent border-none shadow-none rounded-none px-0 py-4 text-sm font-bold data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary transition-all flex gap-2 items-center"
                    >
                        <CreditCard className="h-4 w-4" /> Facturation
                    </TabsTrigger>
                    <TabsTrigger
                        value="security"
                        className="bg-transparent border-none shadow-none rounded-none px-0 py-4 text-sm font-bold data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary transition-all flex gap-2 items-center"
                    >
                        <Shield className="h-4 w-4" /> Sécurité
                    </TabsTrigger>
                    <TabsTrigger
                        value="history"
                        className="bg-transparent border-none shadow-none rounded-none px-0 py-4 text-sm font-bold data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary transition-all flex gap-2 items-center"
                    >
                        <History className="h-4 w-4" /> Historique
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="billing" className="mt-0 outline-none">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2">
                            <Card className="rounded-[2rem] border-border shadow-sm overflow-hidden">
                                <CardContent className="p-8">
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-xs font-black uppercase tracking-wider text-muted-foreground">Nom de l&apos;entreprise</label>
                                                <Input
                                                    name="companyName"
                                                    value={formData.companyName}
                                                    onChange={handleChange}
                                                    className="rounded-xl border-border bg-muted/5 focus:bg-white transition-all font-medium py-6"
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-black uppercase tracking-wider text-muted-foreground">Numéro de TVA</label>
                                                <div className="relative">
                                                    <Input
                                                        name="vatNumber"
                                                        value={formData.vatNumber}
                                                        onChange={handleChange}
                                                        className="rounded-xl border-border bg-muted/5 focus:bg-white transition-all font-medium py-6 pr-24"
                                                        placeholder="ex: BE0..."
                                                        required
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        onClick={checkVat}
                                                        disabled={loadingVat}
                                                        className="absolute right-2 top-1/2 -translate-y-1/2 h-8 text-[10px] font-black uppercase tracking-widest hover:bg-primary/10 hover:text-primary rounded-lg px-3"
                                                    >
                                                        {loadingVat ? "..." : "Vérifier"}
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase tracking-wider text-muted-foreground">Adresse de facturation</label>
                                            <Input
                                                name="address"
                                                value={formData.address}
                                                onChange={handleChange}
                                                className="rounded-xl border-border bg-muted/5 focus:bg-white transition-all font-medium py-6"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase tracking-wider text-muted-foreground">E-mail de contact comptable</label>
                                            <Input
                                                name="email"
                                                type="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                className="rounded-xl border-border bg-muted/5 focus:bg-white transition-all font-medium py-6"
                                                required
                                            />
                                        </div>

                                        {error && <p className="text-red-500 text-sm font-bold">{error}</p>}
                                        {success && <p className="text-primary text-sm font-bold">{success}</p>}

                                        <Button type="submit" disabled={saving} className="rounded-xl h-14 px-8 font-black shadow-lg shadow-primary/20 transition-transform active:scale-95">
                                            {saving ? "Mise à jour..." : "Enregistrer les modifications"}
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                        </div>
                        <div>
                            <div className="card p-8 bg-primary/5 border-primary/10 rounded-[2rem]">
                                <h4 className="font-black text-primary uppercase text-[10px] tracking-widest mb-4">Note importante</h4>
                                <p className="text-sm text-primary/80 font-medium leading-relaxed">
                                    Ces informations servent de base à l&apos;émission de vos factures de formation. Toute modification sera immédiatement appliquée aux prochaines facturations.
                                </p>
                            </div>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="security" className="mt-0 outline-none">
                    <Card className="rounded-[2rem] border-border shadow-sm bg-muted/5 border-dashed">
                        <CardContent className="p-20 text-center flex flex-col items-center">
                            <Shield className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
                            <h3 className="text-xl font-bold mb-2">Sécurité du compte</h3>
                            <p className="text-muted-foreground font-medium max-w-xs mx-auto">
                                Le changement de mot de passe et l&apos;authentification à deux facteurs seront disponibles prochainement.
                            </p>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="history" className="mt-0 outline-none">
                    <Card className="rounded-[2rem] border-border shadow-sm">
                        <CardContent className="p-8">
                            {auditLogs.length === 0 ? (
                                <div className="text-center py-12">
                                    <p className="text-muted-foreground font-bold italic">Aucune modification enregistrée à ce jour.</p>
                                </div>
                            ) : (
                                <div className="space-y-8">
                                    {auditLogs.map((entry, i) => (
                                        <div key={i} className="relative pl-8 border-l-2 border-primary/20 last:border-0 pb-8 last:pb-0">
                                            <div className="absolute left-[-9px] top-0 h-4 w-4 rounded-full bg-primary ring-4 ring-orange-50" />
                                            <div className="flex flex-col gap-1 mb-4">
                                                <p className="text-xs font-black uppercase text-muted-foreground tracking-widest">
                                                    {new Date(entry.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                                <p className="text-xs font-bold">Modifié par <span className="text-primary">{entry.by}</span></p>
                                            </div>
                                            <div className="bg-muted/5 rounded-2xl p-4 space-y-2 border border-border/50">
                                                {entry.changes.map((change, j) => (
                                                    <div key={j} className="text-sm flex flex-wrap gap-2 items-center">
                                                        <span className="font-bold uppercase text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded">{change.field}</span>
                                                        <span className="line-through text-muted-foreground/40">{change.old}</span>
                                                        <span className="text-primary">→</span>
                                                        <span className="font-bold">{change.new}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
