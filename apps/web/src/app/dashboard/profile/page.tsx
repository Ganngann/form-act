"use client";

import { useEffect, useState } from "react";
import { API_URL } from "@/lib/config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

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

export default function ClientProfilePage() {
  const [profile, setProfile] = useState<ClientProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form State
  const [formData, setFormData] = useState({
    companyName: "",
    vatNumber: "",
    address: "",
    email: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      // Need credentials to send cookie
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

      setSuccess("Profil mis à jour avec succès");
      fetchProfile(); // Refresh audit log
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8">Chargement...</div>;
  if (!profile) return <div className="p-8 text-red-500">Erreur: {error}</div>;

  const auditLogs: AuditEntry[] = profile.auditLog ? JSON.parse(profile.auditLog) : [];

  return (
    <div className="container mx-auto py-10 px-4 space-y-8">
      <h1 className="text-3xl font-bold">Mon Profil</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Formulaire */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Informations de Facturation</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nom de l&apos;entreprise</label>
                  <Input
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Numéro de TVA</label>
                  <Input
                    name="vatNumber"
                    value={formData.vatNumber}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Adresse de facturation</label>
                  <Input
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email (Contact & Compta)</label>
                  <Input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                {error && <p className="text-red-500 text-sm">{error}</p>}
                {success && <p className="text-green-600 text-sm">{success}</p>}

                <Button type="submit" disabled={saving}>
                  {saving ? "Enregistrement..." : "Enregistrer les modifications"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Historique */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Historique des modifications</CardTitle>
            </CardHeader>
            <CardContent>
              {auditLogs.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aucune modification enregistrée.</p>
              ) : (
                <div className="space-y-6">
                  {auditLogs.map((entry, i) => (
                    <div key={i} className="border-l-2 border-primary/20 pl-4">
                      <p className="text-xs text-muted-foreground">
                        {new Date(entry.date).toLocaleString()} par {entry.by}
                      </p>
                      <ul className="mt-1 space-y-1">
                        {entry.changes.map((change, j) => (
                          <li key={j} className="text-sm">
                            <span className="font-semibold">{change.field}:</span>{" "}
                            <span className="line-through text-red-400 opacity-60">{change.old}</span>{" "}
                            <span className="text-muted-foreground">→</span>{" "}
                            <span className="text-green-600">{change.new}</span>
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
