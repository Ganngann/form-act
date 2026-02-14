"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Package, Edit2, Wifi, FileText, Tv, Save, MapPin } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { API_URL } from "@/lib/config";
import { LogisticsSummary } from "./LogisticsSummary";

interface AdminLogisticsCardProps {
    session: any;
}

const VIDEO_OPTIONS = ["Projecteur", "Écran TV", "Apporté par le formateur"];
const WRITING_OPTIONS = ["Flipchart", "Marqueurs", "Tableau blanc"];

export function AdminLogisticsCard({ session }: AdminLogisticsCardProps) {
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);

    // Initial state matching User Logistics Schema
    let initialLogistics;
    try {
        initialLogistics = session.logistics
            ? JSON.parse(session.logistics)
            : { wifi: null, subsidies: null, videoMaterial: [], writingMaterial: [], accessDetails: "" };
    } catch {
        initialLogistics = { wifi: null, subsidies: null, videoMaterial: [], writingMaterial: [], accessDetails: "" };
    }

    const [location, setLocation] = useState(session.location || "");
    const [wifi, setWifi] = useState<"yes" | "no" | null>(initialLogistics.wifi);
    const [subsidies, setSubsidies] = useState<"yes" | "no" | null>(initialLogistics.subsidies);
    const [videoMaterial, setVideoMaterial] = useState<string[]>(initialLogistics.videoMaterial || []);
    const [writingMaterial, setWritingMaterial] = useState<string[]>(initialLogistics.writingMaterial || []);
    const [accessDetails, setAccessDetails] = useState(initialLogistics.accessDetails || "");

    const handleSave = async () => {
        setLoading(true);
        const logisticsObj = {
            wifi,
            subsidies,
            videoMaterial,
            writingMaterial,
            accessDetails
        };

        try {
            const res = await fetch(`${API_URL}/sessions/${session.id}/admin-update`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    logistics: JSON.stringify(logisticsObj),
                    location: location // Location is updated alongside logistics
                }),
                credentials: "include"
            });

            if (!res.ok) throw new Error("Update failed");

            setIsEditing(false);
            router.refresh();
        } catch (e) {
            alert("Erreur lors de la mise à jour des informations logistiques");
        } finally {
            setLoading(false);
        }
    };

    const toggleMaterial = (type: 'video' | 'writing', item: string) => {
        if (type === 'video') {
            if (item === 'NONE') {
                // If clicking NONE, clear everything else and set NONE, or toggle off if already NONE
                setVideoMaterial(prev => prev.includes('NONE') ? [] : ['NONE']);
            } else {
                // If clicking a normal item, add/remove it and ENSURE NONE is removed
                setVideoMaterial(prev => {
                    const newPrev = prev.filter(i => i !== 'NONE');
                    return newPrev.includes(item)
                        ? newPrev.filter(i => i !== item)
                        : [...newPrev, item];
                });
            }
        } else {
            // Writing material logic (simple toggle)
            setWritingMaterial(prev =>
                prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
            );
        }
    };

    return (
        <Card className="rounded-[2rem] border-transparent shadow-sm bg-white h-full overflow-hidden">
            <CardHeader className="pb-2 border-b border-gray-50 bg-gray-50/30">
                <div className="flex justify-between items-center">
                    <CardTitle className="text-lg font-black flex items-center gap-2">
                        <Package className="h-5 w-5 text-primary" /> Logistique
                    </CardTitle>
                    {!isEditing ? (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsEditing(true)}
                            className="rounded-xl h-8 text-primary hover:text-primary hover:bg-primary/10 font-bold gap-2"
                        >
                            <Edit2 className="h-3.5 w-3.5" /> Modifier
                        </Button>
                    ) : (
                        <div className="flex gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsEditing(false)}
                                className="rounded-xl h-8 text-muted-foreground hover:bg-muted font-bold"
                            >
                                Annuler
                            </Button>
                            <Button
                                size="sm"
                                onClick={handleSave}
                                disabled={loading}
                                className="rounded-xl h-8 bg-primary hover:bg-primary/90 text-white font-bold gap-2"
                            >
                                <Save className="h-3.5 w-3.5" /> Enregistrer
                            </Button>
                        </div>
                    )}
                </div>
            </CardHeader>
            <CardContent className="pt-6">
                {!isEditing ? (
                    <LogisticsSummary logistics={session.logistics} />
                ) : (
                    <div className="space-y-6">
                        {/* Location */}
                        <div className="space-y-2">
                            <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Lieu de la prestation</Label>
                            <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <Input
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    placeholder="Adresse, Ville..."
                                    className="font-medium"
                                />
                            </div>
                        </div>

                        {/* Wifi & Subsides - Radio Groups */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100 space-y-2">
                                <Label className="font-bold text-sm flex items-center gap-2"><Wifi className="h-4 w-4" /> Wifi</Label>
                                <RadioGroup value={wifi || ""} onValueChange={(val: "yes" | "no") => setWifi(val)}>
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

                            <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100 space-y-2">
                                <Label className="font-bold text-sm flex items-center gap-2"><FileText className="h-4 w-4" /> Subsides</Label>
                                <RadioGroup value={subsidies || ""} onValueChange={(val: "yes" | "no") => setSubsidies(val)}>
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

                        {/* Material Vidéo */}
                        <div className="space-y-3">
                            <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Matériel Vidéo</Label>
                            <div className="flex flex-wrap gap-2">
                                <Badge
                                    variant={videoMaterial.includes('NONE') ? "destructive" : "outline"}
                                    className="cursor-pointer"
                                    onClick={() => toggleMaterial('video', 'NONE')}
                                >
                                    Aucun
                                </Badge>
                                {VIDEO_OPTIONS.map(item => (
                                    <Badge
                                        key={item}
                                        variant={videoMaterial.includes(item) ? "default" : "outline"}
                                        className={`cursor-pointer transition-all ${videoMaterial.includes(item)
                                            ? 'bg-primary hover:bg-primary/90'
                                            : 'text-gray-500 hover:bg-gray-50'
                                            }`}
                                        onClick={() => toggleMaterial('video', item)}
                                    >
                                        {item}
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        {/* Material Écriture */}
                        <div className="space-y-3">
                            <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Matériel d&apos;écriture</Label>
                            <div className="flex flex-wrap gap-2">
                                {WRITING_OPTIONS.map(item => (
                                    <Badge
                                        key={item}
                                        variant={writingMaterial.includes(item) ? "default" : "outline"}
                                        className={`cursor-pointer transition-all ${writingMaterial.includes(item)
                                            ? 'bg-blue-600 hover:bg-blue-700'
                                            : 'text-gray-500 hover:bg-gray-50'
                                            }`}
                                        onClick={() => toggleMaterial('writing', item)}
                                    >
                                        {item}
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Logistique d&apos;accès & Notes</Label>
                            <Textarea
                                value={accessDetails}
                                onChange={(e) => setAccessDetails(e.target.value)}
                                placeholder="Étage, code d'entrée, parking, contact sur place..."
                                className="rounded-2xl border-gray-100 bg-gray-50/50 min-h-[100px] font-medium"
                            />
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

