"use client";

import { useState, useEffect, useCallback } from "react";
import { API_URL } from "@/lib/config";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { Trash2 } from "lucide-react";
import { Session, Unavailability } from "@/hooks/use-booking-logic";

export function AvailabilityManager({ trainerId }: { trainerId: string }) {
    const [defaultDays, setDefaultDays] = useState<number[]>([1, 2, 3, 4, 5]);
    const [unavailabilities, setUnavailabilities] = useState<Unavailability[]>([]);
    const [sessions, setSessions] = useState<Session[]>([]);

    const [newDate, setNewDate] = useState<string>("");
    const [newSlot, setNewSlot] = useState<string>("ALL_DAY");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            // Get current month
            const today = new Date();
            const monthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

            const res = await fetch(`${API_URL}/trainers/${trainerId}/availability?month=${monthStr}`, {
                credentials: "include"
            });
            if (res.ok) {
                const data = await res.json();
                setDefaultDays(typeof data.defaultAvailableDays === "string" ? JSON.parse(data.defaultAvailableDays) : (data.defaultAvailableDays || [1,2,3,4,5]));
                setUnavailabilities(data.unavailabilities || []);
                setSessions(data.sessions || []);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [trainerId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleDefaultDaysSave = async () => {
        setSaving(true);
        try {
            await fetch(`${API_URL}/trainers/${trainerId}/settings`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ defaultAvailableDays: JSON.stringify(defaultDays) }),
                credentials: "include"
            });
            alert("Jours par défaut mis à jour !");
        } catch (e) {
            console.error(e);
            alert("Erreur lors de la mise à jour");
        } finally {
            setSaving(false);
        }
    };

    const toggleDay = (dayIndex: number) => {
        if (defaultDays.includes(dayIndex)) {
            setDefaultDays(defaultDays.filter(d => d !== dayIndex));
        } else {
            setDefaultDays([...defaultDays, dayIndex].sort());
        }
    };

    const addUnavailability = async () => {
        if (!newDate) return;
        setSaving(true);
        try {
            await fetch(`${API_URL}/trainers/${trainerId}/unavailability`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ date: newDate, slot: newSlot }),
                credentials: "include"
            });
            setNewDate("");
            setNewSlot("ALL_DAY");
            await fetchData();
        } catch (e) {
            console.error(e);
        } finally {
            setSaving(false);
        }
    };

    const removeUnavailability = async (id: string) => {
        setSaving(true);
        try {
            await fetch(`${API_URL}/trainers/${trainerId}/unavailability/${id}`, {
                method: "DELETE",
                credentials: "include"
            });
            await fetchData();
        } catch (e) {
            console.error(e);
        } finally {
            setSaving(false);
        }
    };

    const days = [
        { label: "Lundi", value: 1 },
        { label: "Mardi", value: 2 },
        { label: "Mercredi", value: 3 },
        { label: "Jeudi", value: 4 },
        { label: "Vendredi", value: 5 },
        { label: "Samedi", value: 6 },
        { label: "Dimanche", value: 0 },
    ];

    if (loading) return <div>Chargement...</div>;

    return (
        <div className="space-y-8">
            <Card>
                <CardContent className="p-6">
                    <h3 className="text-xl font-bold mb-4">Jours de travail par défaut</h3>
                    <p className="text-muted-foreground mb-4">Sélectionnez les jours de la semaine où vous êtes généralement disponible.</p>
                    <div className="flex flex-wrap gap-4 mb-6">
                        {days.map(day => (
                            <div key={day.value} className="flex items-center space-x-2">
                                <Checkbox
                                    id={`day-${day.value}`}
                                    checked={defaultDays.includes(day.value)}
                                    onCheckedChange={() => toggleDay(day.value)}
                                />
                                <Label htmlFor={`day-${day.value}`}>{day.label}</Label>
                            </div>
                        ))}
                    </div>
                    <Button onClick={handleDefaultDaysSave} disabled={saving}>Sauvegarder les jours</Button>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-6">
                    <h3 className="text-xl font-bold mb-4">Ajouter une indisponibilité (Congé, formation externe...)</h3>
                    <div className="flex gap-4 items-end mb-6">
                        <div className="space-y-2 flex-1">
                            <Label>Date</Label>
                            <Input
                                type="date"
                                value={newDate}
                                onChange={e => setNewDate(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2 flex-1">
                            <Label>Créneau</Label>
                            <Select value={newSlot} onValueChange={setNewSlot}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Sélectionner..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL_DAY">Toute la journée</SelectItem>
                                    <SelectItem value="AM">Matin</SelectItem>
                                    <SelectItem value="PM">Après-midi</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <Button onClick={addUnavailability} disabled={saving || !newDate}>Ajouter</Button>
                    </div>

                    <div className="space-y-4">
                        <h4 className="font-semibold text-lg">Vos indisponibilités ponctuelles</h4>
                        {unavailabilities.length === 0 ? (
                            <p className="text-muted-foreground">Aucune indisponibilité enregistrée.</p>
                        ) : (
                            <div className="grid gap-2">
                                {unavailabilities.map(u => (
                                    <div key={u.id} className="flex justify-between items-center p-3 border rounded-lg bg-muted/50">
                                        <div>
                                            <span className="font-medium">{format(new Date(u.date), 'dd/MM/yyyy')}</span>
                                            <span className="ml-2 text-sm text-muted-foreground">
                                                {u.slot === 'ALL_DAY' ? 'Toute la journée' : u.slot === 'AM' ? 'Matin' : 'Après-midi'}
                                            </span>
                                        </div>
                                        <Button variant="ghost" size="sm" onClick={() => removeUnavailability(u.id)}>
                                            <Trash2 className="h-4 w-4 text-red-500" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
