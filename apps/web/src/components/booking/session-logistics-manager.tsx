"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { differenceInCalendarDays } from "date-fns";
import { Loader2, Plus, Trash2, Edit2, Lock, MapPin, Info } from "lucide-react";

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
import { Progress } from "@/components/ui/progress";
import { API_URL } from "@/lib/config";
import { cn } from "@/lib/utils";

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
            wifi: initialLogistics.wifi || undefined, // undefined for radio group reset
            subsidies: initialLogistics.subsidies || undefined,
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
    const isLocked = daysUntilSession <= 7 && !session.isLogisticsOpen; // Fixed to <= 7

    const watchedValues = form.watch();

    // Calculate Completion Rate
    const calculateCompletion = () => {
        let score = 0;
        const total = 5;

        // 1. Location
        if (watchedValues.location && watchedValues.location.trim().length > 0) score++;

        // 2. Wifi
        if (watchedValues.wifi === "yes" || watchedValues.wifi === "no") score++;

        // 3. Subsides
        if (watchedValues.subsidies === "yes" || watchedValues.subsidies === "no") score++;

        // 4. Material
        const hasVideo = watchedValues.videoMaterial && watchedValues.videoMaterial.length > 0;
        const hasWriting = watchedValues.writingMaterial && watchedValues.writingMaterial.length > 0;
        const hasNone = watchedValues.videoMaterial?.includes("NONE");

        if (hasVideo || hasWriting || hasNone) score++;

        // 5. Participants
        if (watchedValues.participants && watchedValues.participants.length > 0) {
            // Check if at least one participant has a name
            const validPart = watchedValues.participants.some(p => p.firstName || p.lastName || p.email);
            if (validPart) score++;
        }

        return Math.round((score / total) * 100);
    };

    const completionRate = calculateCompletion();

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

    const handleMaterialChange = (type: 'video' | 'writing', item: string, checked: boolean | string) => {
        if (type === 'video' && item === 'NONE') {
            if (checked) {
                // Clear all others and set NONE
                form.setValue('videoMaterial', ['NONE']);
                form.setValue('writingMaterial', []);
            } else {
                form.setValue('videoMaterial', []);
            }
        } else {
            // Normal item check
            if (checked) {
                // Remove NONE if it exists
                const currentVideo = form.getValues('videoMaterial') || [];
                if (currentVideo.includes('NONE')) {
                    form.setValue('videoMaterial', []);
                }

                const currentList = form.getValues(type === 'video' ? 'videoMaterial' : 'writingMaterial') || [];
                // If checking a normal item, add it (and ensure NONE is gone from videoMaterial if we are editing writingMaterial)
                if (type === 'writing') {
                    const vid = form.getValues('videoMaterial') || [];
                    if (vid.includes('NONE')) form.setValue('videoMaterial', []);
                }

                form.setValue(type === 'video' ? 'videoMaterial' : 'writingMaterial', [...(type === 'video' ? form.getValues('videoMaterial') || [] : form.getValues('writingMaterial') || []), item]);

            } else {
                const currentList = form.getValues(type === 'video' ? 'videoMaterial' : 'writingMaterial') || [];
                form.setValue(type === 'video' ? 'videoMaterial' : 'writingMaterial', currentList.filter((v) => v !== item));
            }
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-700">
            {/* Display View */}
            <section className="bg-white p-8 rounded-[2rem] border border-border shadow-sm space-y-6">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary">
                            <MapPin className="h-5 w-5" />
                        </div>
                        <h3 className="font-bold text-xl tracking-tight">Lieu et Logistique</h3>
                    </div>
                    {isLocked ? (
                        <div className="flex items-center gap-2 text-orange-600 bg-orange-50 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-orange-100 shadow-sm" title="Modifications verrouillées à J-7">
                            <Lock className="h-3.5 w-3.5" />
                            <span>Verrouillé (J-7)</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-6">
                            {completionRate < 100 && (
                                <div className="hidden md:flex flex-col w-40 gap-2">
                                    <div className="flex justify-between text-[10px] text-muted-foreground uppercase font-black tracking-widest">
                                        <span>Dossier Complété</span>
                                        <span className="text-primary">{completionRate}%</span>
                                    </div>
                                    <Progress value={completionRate} className="h-1.5" />
                                </div>
                            )}
                            <Button variant="outline" size="sm" onClick={() => setOpen(true)} className="rounded-xl font-bold h-10 px-4 border-primary/20 text-primary hover:bg-primary/5 shadow-none transition-all">
                                <Edit2 className="h-4 w-4 mr-2" />
                                Modifier les infos
                            </Button>
                        </div>
                    )}
                </div>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <span className="block text-[10px] font-black text-muted-foreground uppercase tracking-[2px]">Lieu de la formation</span>
                        <div className="font-bold text-foreground bg-muted/5 p-5 rounded-2xl border border-border/50 leading-relaxed">
                            {session.location || "À confirmer - L'adresse de votre entreprise sera utilisée par défaut."}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <span className="block text-[10px] font-black text-muted-foreground uppercase tracking-[2px]">Matériel & Accès</span>
                            <div className="bg-muted/5 p-6 rounded-2xl border border-border/50 text-sm space-y-4 min-h-[160px]">
                                {session.logistics ? (
                                    <div className="space-y-3">
                                        {initialLogistics.videoMaterial?.includes('NONE') ? (
                                            <p className="font-bold text-muted-foreground italic flex items-center gap-2">
                                                <Info className="h-4 w-4" /> Aucun matériel requis sur place.
                                            </p>
                                        ) : (
                                            <div className="space-y-2">
                                                {initialLogistics.videoMaterial?.length > 0 && (
                                                    <p className="text-foreground"><span className="text-[10px] font-black text-primary uppercase mr-2 opacity-60">Vidéo:</span> <span className="font-bold">{initialLogistics.videoMaterial.join(", ")}</span></p>
                                                )}
                                                {initialLogistics.writingMaterial?.length > 0 && (
                                                    <p className="text-foreground"><span className="text-[10px] font-black text-primary uppercase mr-2 opacity-60">Écrit:</span> <span className="font-bold">{initialLogistics.writingMaterial.join(", ")}</span></p>
                                                )}
                                            </div>
                                        )}

                                        <div className="flex gap-4 pt-2">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-black text-muted-foreground uppercase opacity-60">Wifi:</span>
                                                <span className={cn("px-2 py-0.5 rounded text-[10px] font-black uppercase", initialLogistics.wifi === "yes" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700")}>
                                                    {initialLogistics.wifi === "yes" ? "Oui" : "Non"}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-black text-muted-foreground uppercase opacity-60">Subsides:</span>
                                                <span className={cn("px-2 py-0.5 rounded text-[10px] font-black uppercase", initialLogistics.subsidies === "yes" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700")}>
                                                    {initialLogistics.subsidies === "yes" ? "Oui" : "Non"}
                                                </span>
                                            </div>
                                        </div>

                                        {initialLogistics.accessDetails && (
                                            <div className="pt-3 border-t border-border/50 mt-3">
                                                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-1">Détails d&apos;accès:</span>
                                                <p className="font-medium text-foreground/80 leading-relaxed italic">&quot;{initialLogistics.accessDetails}&quot;</p>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="h-full flex items-center justify-center">
                                        <p className="text-muted-foreground font-bold italic text-xs tracking-tight">Aucune information logistique renseignée.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center mb-1">
                                <span className="block text-[10px] font-black text-muted-foreground uppercase tracking-[2px]">Participants ({initialParticipants.length})</span>
                            </div>
                            <div className="bg-muted/5 p-6 rounded-2xl border border-border/50 text-sm space-y-3 min-h-[160px] max-h-[240px] overflow-y-auto">
                                {initialParticipants.length > 0 ? (
                                    <ul className="space-y-3">
                                        {initialParticipants.map((p: any, i: number) => (
                                            <li key={i} className="flex items-center gap-3 group">
                                                <div className="h-8 w-8 rounded-lg bg-white border border-border flex items-center justify-center text-[10px] font-black text-primary group-hover:border-primary transition-colors uppercase">
                                                    {(p.firstName?.[0] || '') + (p.lastName?.[0] || '')}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-foreground leading-none">{p.firstName || p.name} {p.lastName}</span>
                                                    {p.email && <span className="text-[10px] font-medium text-muted-foreground tracking-tight">{p.email}</span>}
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <div className="h-full flex items-center justify-center">
                                        <p className="text-muted-foreground font-bold italic text-xs tracking-tight">Aucun participant encodé.</p>
                                    </div>
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

                    <div className="w-full bg-slate-50 p-4 rounded-lg border mb-4">
                        <div className="flex justify-between text-sm font-medium mb-2">
                            <span>Complétion du dossier</span>
                            <span>{completionRate}%</span>
                        </div>
                        <Progress value={completionRate} className="h-3" />
                        {completionRate < 100 && (
                            <p className="text-xs text-muted-foreground mt-2">
                                Il manque encore des informations pour valider ce dossier.
                            </p>
                        )}
                    </div>

                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">

                        {/* Location */}
                        <div className="space-y-2">
                            <Label htmlFor="location">Adresse de la prestation *</Label>
                            <Input id="location" {...form.register("location")} placeholder="Rue, Ville, Code Postal" />
                            {form.formState.errors.location && (
                                <p className="text-red-500 text-sm">{form.formState.errors.location.message}</p>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Material */}
                            <div className="space-y-4">
                                <Label className="text-base">Matériel présent *</Label>

                                <div className="space-y-3 border p-3 rounded-md">
                                    <div className="flex items-center space-x-2 pb-2 border-b mb-2">
                                        <Checkbox
                                            id="video-NONE"
                                            checked={form.watch("videoMaterial")?.includes("NONE")}
                                            onCheckedChange={(c) => handleMaterialChange('video', 'NONE', c)}
                                        />
                                        <Label htmlFor="video-NONE" className="font-bold text-gray-700">Aucun matériel disponible sur place</Label>
                                    </div>

                                    <Label className="text-xs uppercase text-muted-foreground">Vidéo</Label>
                                    {["Projecteur", "Écran TV", "Apporté par le formateur"].map((item) => (
                                        <div key={item} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`video-${item}`}
                                                checked={form.watch("videoMaterial")?.includes(item)}
                                                onCheckedChange={(c) => handleMaterialChange('video', item, c)}
                                                disabled={form.watch("videoMaterial")?.includes("NONE")}
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
                                                onCheckedChange={(c) => handleMaterialChange('writing', item, c)}
                                                disabled={form.watch("videoMaterial")?.includes("NONE")}
                                            />
                                            <Label htmlFor={`writing-${item}`} className="font-normal">{item}</Label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Wifi & Subsides */}
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <Label>Connexion Wi-Fi disponible ? *</Label>
                                    <RadioGroup
                                        onValueChange={(val) => form.setValue("wifi", val as "yes" | "no")}
                                        value={form.watch("wifi") || ""}
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
                                    <Label>Dossier Subsides (FormTS) ? *</Label>
                                    <RadioGroup
                                        onValueChange={(val) => form.setValue("subsidies", val as "yes" | "no")}
                                        value={form.watch("subsidies") || ""}
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
                                <Label className="text-base">Participants *</Label>
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
