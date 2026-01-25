"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { differenceInCalendarDays } from "date-fns";
import { Loader2, Plus, Trash2, Edit2, Lock, MapPin } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { API_URL } from "@/lib/config";

// --- Types & Schema ---

const participantSchema = z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    email: z.string().email("Email invalide").or(z.literal("")).optional(),
});

const logisticsSchema = z.object({
    location: z.string().optional(),
    videoMaterial: z.array(z.string()).optional(),
    writingMaterial: z.array(z.string()).optional(),
    wifi: z.enum(["yes", "no"]).nullable().optional().or(z.literal("")),
    subsidies: z.enum(["yes", "no"]).nullable().optional().or(z.literal("")),
    accessDetails: z.string().optional(),
    participants: z.array(participantSchema).optional(),
});

type LogisticsFormValues = z.infer<typeof logisticsSchema>;

interface Session {
    id: string;
    date: string;
    location: string | null;
    logistics: string | null; // JSON string
    participants: string | null; // JSON string
    isLogisticsOpen: boolean;
    status: string;
}

export function SessionLogisticsManager({ session }: { session: Session }) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // Parse initial data
    const initialLogistics = session.logistics ? JSON.parse(session.logistics) : {};
    const initialParticipants = session.participants ? JSON.parse(session.participants) : [];

    const form = useForm<LogisticsFormValues>({
        resolver: zodResolver(logisticsSchema),
        defaultValues: {
            location: session.location || "",
            videoMaterial: initialLogistics.videoMaterial || [],
            writingMaterial: initialLogistics.writingMaterial || [],
            wifi: initialLogistics.wifi || "no",
            subsidies: initialLogistics.subsidies || "no",
            accessDetails: initialLogistics.accessDetails || "",
            participants: initialParticipants.length > 0 ? initialParticipants : [{ firstName: "", lastName: "", email: "" }],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "participants",
    });

    // Locking Logic
    const daysUntilSession = differenceInCalendarDays(new Date(session.date), new Date());
    const isLocked = daysUntilSession < 7 && !session.isLogisticsOpen;

    const onSubmit = async (data: LogisticsFormValues) => {
        setLoading(true);
        try {
            const logisticsPayload = {
                videoMaterial: data.videoMaterial,
                writingMaterial: data.writingMaterial,
                wifi: data.wifi,
                subsidies: data.subsidies,
                accessDetails: data.accessDetails,
            };

            const res = await fetch(`${API_URL}/sessions/${session.id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include", // Important for cookies
                body: JSON.stringify({
                    location: data.location,
                    logistics: JSON.stringify(logisticsPayload),
                    participants: JSON.stringify(data.participants),
                }),
            });

            if (!res.ok) throw new Error("Erreur lors de la mise à jour");

            setOpen(false);
            router.refresh(); // Refresh server component data
        } catch (error) {
            console.error(error);
            alert("Une erreur est survenue lors de l'enregistrement.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            {/* Display View */}
            <section className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2 mb-2">
                        <MapPin className="h-5 w-5 text-primary" />
                        <h3 className="font-bold text-lg">Lieu et Logistique</h3>
                    </div>
                    {isLocked ? (
                        <div className="flex items-center gap-1 text-amber-600 bg-amber-50 px-3 py-1 rounded-full text-xs font-medium border border-amber-200" title="Modifications verrouillées à J-7">
                            <Lock className="h-3 w-3" />
                            <span>Verrouillé (J-7)</span>
                        </div>
                    ) : (
                        <Button variant="outline" size="sm" onClick={() => setOpen(true)} className="gap-2">
                            <Edit2 className="h-4 w-4" />
                            Modifier
                        </Button>
                    )}
                </div>

                <div className="space-y-4">
                    <div>
                        <span className="block text-xs font-semibold text-gray-500 uppercase mb-1">Lieu de la formation</span>
                        <p className="font-medium bg-gray-50 p-3 rounded border">
                            {session.location || "À confirmer - L'adresse de votre entreprise sera utilisée par défaut."}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <span className="block text-xs font-semibold text-gray-500 uppercase mb-1">Matériel & Accès</span>
                            <div className="bg-gray-50 p-4 rounded border text-sm space-y-2 min-h-[100px]">
                                {session.logistics ? (
                                    <>
                                        {initialLogistics.videoMaterial?.length > 0 && (
                                            <p><strong>Vidéo:</strong> {initialLogistics.videoMaterial.join(", ")}</p>
                                        )}
                                        {initialLogistics.writingMaterial?.length > 0 && (
                                            <p><strong>Écrit:</strong> {initialLogistics.writingMaterial.join(", ")}</p>
                                        )}
                                        <p><strong>Wifi:</strong> {initialLogistics.wifi === "yes" ? "Oui" : "Non"}</p>
                                        <p><strong>Subsides:</strong> {initialLogistics.subsidies === "yes" ? "Oui" : "Non"}</p>
                                        {initialLogistics.accessDetails && (
                                            <div className="pt-2 border-t mt-2">
                                                <strong>Accès:</strong>
                                                <p className="whitespace-pre-wrap">{initialLogistics.accessDetails}</p>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <p className="text-muted-foreground italic">Aucune information logistique renseignée.</p>
                                )}
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <span className="block text-xs font-semibold text-gray-500 uppercase">Participants ({initialParticipants.length})</span>
                            </div>
                            <div className="bg-gray-50 p-4 rounded border text-sm space-y-2 min-h-[100px] max-h-[200px] overflow-y-auto">
                                {initialParticipants.length > 0 ? (
                                    <ul className="space-y-1">
                                        {initialParticipants.map((p: any, i: number) => (
                                            <li key={i} className="flex flex-col">
                                                <span className="font-medium">{p.firstName || p.name} {p.lastName}</span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-muted-foreground italic">Aucun participant encodé.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Edit Dialog */}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Modifier la logistique</DialogTitle>
                        <DialogDescription>
                            Remplissez les informations ci-dessous. Les modifications sont possibles jusqu&apos;à 7 jours avant la session.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">

                        {/* Location */}
                        <div className="space-y-2">
                            <Label htmlFor="location">Adresse de la prestation</Label>
                            <Input id="location" {...form.register("location")} placeholder="Rue, Ville, Code Postal" />
                            {form.formState.errors.location && (
                                <p className="text-red-500 text-sm">{form.formState.errors.location.message}</p>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Material */}
                            <div className="space-y-4">
                                <Label className="text-base">Matériel nécessaire</Label>

                                <div className="space-y-3 border p-3 rounded-md">
                                    <Label className="text-xs uppercase text-muted-foreground">Vidéo</Label>
                                    {["Projecteur", "Écran TV", "Apporté par le formateur"].map((item) => (
                                        <div key={item} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`video-${item}`}
                                                checked={form.watch("videoMaterial")?.includes(item)}
                                                onCheckedChange={(checked) => {
                                                    const current = form.getValues("videoMaterial") || [];
                                                    if (checked) form.setValue("videoMaterial", [...current, item]);
                                                    else form.setValue("videoMaterial", current.filter((v) => v !== item));
                                                }}
                                            />
                                            <Label htmlFor={`video-${item}`} className="font-normal">{item}</Label>
                                        </div>
                                    ))}
                                </div>

                                <div className="space-y-3 border p-3 rounded-md">
                                    <Label className="text-xs uppercase text-muted-foreground">Support Écrit</Label>
                                    {["Flipchart", "Marqueurs", "Tableau blanc"].map((item) => (
                                        <div key={item} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`writing-${item}`}
                                                checked={form.watch("writingMaterial")?.includes(item)}
                                                onCheckedChange={(checked) => {
                                                    const current = form.getValues("writingMaterial") || [];
                                                    if (checked) form.setValue("writingMaterial", [...current, item]);
                                                    else form.setValue("writingMaterial", current.filter((v) => v !== item));
                                                }}
                                            />
                                            <Label htmlFor={`writing-${item}`} className="font-normal">{item}</Label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Wifi & Subsides */}
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <Label>Connexion Wi-Fi disponible ?</Label>
                                    <RadioGroup
                                        onValueChange={(val) => form.setValue("wifi", val as "yes" | "no")}
                                        value={form.watch("wifi")}
                                        className="flex flex-col space-y-1"
                                    >
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="yes" id="wifi-yes" />
                                            <Label htmlFor="wifi-yes">Oui</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="no" id="wifi-no" />
                                            <Label htmlFor="wifi-no">Non</Label>
                                        </div>
                                    </RadioGroup>
                                </div>

                                <div className="space-y-2">
                                    <Label>Dossier Subsides (FormTS) ?</Label>
                                    <RadioGroup
                                        onValueChange={(val) => form.setValue("subsidies", val as "yes" | "no")}
                                        value={form.watch("subsidies")}
                                        className="flex flex-col space-y-1"
                                    >
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="yes" id="subsidies-yes" />
                                            <Label htmlFor="subsidies-yes">Oui</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="no" id="subsidies-no" />
                                            <Label htmlFor="subsidies-no">Non</Label>
                                        </div>
                                    </RadioGroup>
                                </div>
                            </div>
                        </div>

                        {/* Access Details */}
                        <div className="space-y-2">
                            <Label htmlFor="accessDetails">Logistique d&apos;accès</Label>
                            <Textarea
                                id="accessDetails"
                                {...form.register("accessDetails")}
                                placeholder="Étage, code d'entrée, parking, contact sur place..."
                            />
                        </div>

                        {/* Participants */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label className="text-base">Participants</Label>
                                <Button type="button" variant="outline" size="sm" onClick={() => append({ firstName: "", lastName: "", email: "" })}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Ajouter
                                </Button>
                            </div>

                            <div className="space-y-3">
                                {fields.map((field, index) => (
                                    <div key={field.id} className="flex gap-2 items-start">
                                        <div className="grid grid-cols-3 gap-2 flex-1">
                                            <div className="space-y-1">
                                                <Input {...form.register(`participants.${index}.firstName`)} placeholder="Prénom" aria-label="Prénom" />
                                                {form.formState.errors.participants?.[index]?.firstName && (
                                                    <p className="text-xs text-red-500">{form.formState.errors.participants[index]?.firstName?.message}</p>
                                                )}
                                            </div>
                                            <div className="space-y-1">
                                                <Input {...form.register(`participants.${index}.lastName`)} placeholder="Nom" aria-label="Nom" />
                                                {form.formState.errors.participants?.[index]?.lastName && (
                                                    <p className="text-xs text-red-500">{form.formState.errors.participants[index]?.lastName?.message}</p>
                                                )}
                                            </div>
                                            <div className="space-y-1">
                                                <Input {...form.register(`participants.${index}.email`)} placeholder="Email" aria-label="Email" />
                                                {form.formState.errors.participants?.[index]?.email && (
                                                    <p className="text-xs text-red-500">{form.formState.errors.participants[index]?.email?.message}</p>
                                                )}
                                            </div>
                                        </div>
                                        <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} disabled={fields.length === 1}>
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                            {form.formState.errors.participants?.root && (
                                <p className="text-red-500 text-sm">{form.formState.errors.participants.root.message}</p>
                            )}
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
                            <Button type="submit" disabled={loading}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Enregistrer les modifications
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
