'use client';

import { useEffect, useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { adminFormationsService } from "@/services/admin-formations"
import { Formation, Category, Trainer } from "@/types/formation"
import { Plus, Trash2, FileText, Settings, Image as ImageIcon, BookOpen, Users, Save, X, ChevronRight } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

const schema = z.object({
    title: z.string().min(1, "Le titre est requis"),
    description: z.string().min(1, "La description est requise"),
    level: z.string().min(1, "Le niveau est requis"),
    duration: z.string().min(1, "La durée est requise"),
    durationType: z.enum(["HALF_DAY", "FULL_DAY"]),
    price: z.coerce.number().min(0, "Le prix doit être positif").optional(),
    categoryId: z.string().uuid("La catégorie est requise"),
    isExpertise: z.boolean(),
    authorizedTrainerIds: z.array(z.string()).optional(),
    isPublished: z.boolean(),
    programLink: z.string().optional(),
    methodology: z.string().optional(),
    inclusions: z.string().optional(),
    imageUrl: z.string().optional(),
    agreementCodes: z.string().optional(),
})

type FormData = z.infer<typeof schema>

interface FormationFormProps {
    initialData?: Formation | null
    categories: Category[]
    trainers: Trainer[]
    isEdit?: boolean
}

type Agreement = {
    region: string
    code: string
}

export function FormationForm({
    initialData,
    categories,
    trainers,
    isEdit = false,
}: FormationFormProps) {
    const router = useRouter()
    const [agreements, setAgreements] = useState<Agreement[]>([])
    const [activeTab, setActiveTab] = useState("general")
    const [error, setError] = useState<string | null>(null)

    const {
        register,
        handleSubmit,
        control,
        reset,
        watch,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<FormData>({
        resolver: zodResolver(schema) as any,
        defaultValues: {
            title: "",
            description: "",
            level: "",
            duration: "",
            durationType: "HALF_DAY",
            isPublished: true,
            categoryId: undefined,
            isExpertise: false,
            authorizedTrainerIds: [],
        },
    })

    const isExpertise = watch("isExpertise");
    const authorizedTrainerIds = watch("authorizedTrainerIds");

    useEffect(() => {
        if (initialData) {
            reset({
                title: initialData.title,
                description: initialData.description,
                level: initialData.level,
                duration: initialData.duration,
                durationType: initialData.durationType,
                price: initialData.price,
                categoryId: initialData.categoryId,
                isExpertise: initialData.isExpertise,
                authorizedTrainerIds: initialData.authorizedTrainers?.map(t => t.id) || [],
                isPublished: initialData.isPublished,
                programLink: initialData.programLink || "",
                methodology: initialData.methodology || "",
                inclusions: initialData.inclusions || "",
                imageUrl: initialData.imageUrl || "",
                agreementCodes: initialData.agreementCodes || "",
            })

            if (initialData.agreementCodes) {
                try {
                    const parsed = JSON.parse(initialData.agreementCodes)
                    if (Array.isArray(parsed)) {
                        setAgreements(parsed)
                    }
                } catch (e) {
                    console.error("Failed to parse agreement codes", e)
                    setAgreements([])
                }
            } else {
                setAgreements([])
            }
        }
    }, [initialData, reset])

    const addAgreement = () => {
        setAgreements([...agreements, { region: "", code: "" }])
    }

    const updateAgreement = (index: number, field: keyof Agreement, value: string) => {
        const newAgreements = [...agreements]
        newAgreements[index][field] = value
        setAgreements(newAgreements)
    }

    const removeAgreement = (index: number) => {
        setAgreements(agreements.filter((_, i) => i !== index))
    }

    const onSubmit = async (data: FormData) => {
        setError(null)
        try {
            const validAgreements = agreements.filter(a => a.region && a.code)

            const payload = {
                ...data,
                authorizedTrainerIds: data.isExpertise ? data.authorizedTrainerIds : [],
                price: data.price === undefined || isNaN(data.price) ? undefined : data.price,
                agreementCodes: validAgreements.length > 0 ? JSON.stringify(validAgreements) : undefined
            }

            if (isEdit && initialData) {
                await adminFormationsService.updateFormation(initialData.id, payload)
            } else {
                await adminFormationsService.createFormation(payload)
            }
            router.push('/admin/formations')
            router.refresh()
        } catch (err: any) {
            setError(err.message || "Une erreur est survenue")
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 animate-in fade-in duration-700 [scrollbar-gutter:stable] w-full">
            {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 p-6 rounded-[2rem] text-sm font-bold flex items-center gap-3">
                    <Settings className="h-5 w-5" /> {error}
                </div>
            )}

            <Tabs defaultValue="general" className="w-full" value={activeTab} onValueChange={setActiveTab}>
                <div className="grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] gap-12 items-start w-full">
                    {/* Menu Latéral Fixe */}
                    <div className="space-y-6 lg:sticky lg:top-8 w-full">
                        <Card className="rounded-[2.5rem] border-none shadow-xl bg-white/90 backdrop-blur-md overflow-hidden p-2">
                            <TabsList className="flex flex-col w-full h-auto bg-transparent gap-2 p-1">
                                <TabsTrigger value="general" className="w-full justify-start rounded-2xl px-5 py-4 text-sm font-black data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20 transition-all flex items-center gap-4">
                                    <FileText className="h-4 w-4" /> Général
                                </TabsTrigger>
                                <TabsTrigger value="details" className="w-full justify-start rounded-2xl px-5 py-4 text-sm font-black data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20 transition-all flex items-center gap-4">
                                    <Settings className="h-4 w-4" /> Configuration
                                </TabsTrigger>
                                <TabsTrigger value="media" className="w-full justify-start rounded-2xl px-5 py-4 text-sm font-black data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20 transition-all flex items-center gap-4">
                                    <ImageIcon className="h-4 w-4" /> Médias & Divers
                                </TabsTrigger>
                            </TabsList>
                        </Card>

                        <Card className="rounded-[2.5rem] border-none shadow-xl bg-gradient-to-br from-indigo-600 to-violet-700 text-white p-8 hidden lg:block">
                            <div className="h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center mb-6">
                                <Settings className="h-6 w-6 text-white" />
                            </div>
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-2">Statut Publication</h4>
                            <div className="flex items-center justify-between mb-4">
                                <span className="font-black text-xl italic">{watch('isPublished') ? "Publié" : "Brouillon"}</span>
                                <Controller
                                    control={control}
                                    name="isPublished"
                                    render={({ field }) => (
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                            className="data-[state=checked]:bg-white data-[state=checked]:text-indigo-600"
                                        />
                                    )}
                                />
                            </div>
                            <p className="text-[10px] opacity-60 font-medium leading-relaxed italic">Visible dans le catalogue public s&apos;il est actif.</p>
                        </Card>
                    </div>

                    {/* Zone de Contenu Stable */}
                    <div className="space-y-8 min-h-[800px] pb-32 w-full">
                        <TabsContent value="general" className="mt-0 focus-visible:ring-0 animate-in fade-in duration-300 w-full">
                            <Card className="rounded-[2.5rem] border-none shadow-xl bg-white overflow-hidden">
                                <CardHeader className="bg-gray-50/50 border-b border-gray-100/50 p-8">
                                    <CardTitle className="text-xl font-black flex items-center gap-3 tracking-tight">
                                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                            <FileText className="h-5 w-5" />
                                        </div>
                                        Informations Générales
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-8 space-y-8">
                                    <div className="grid md:grid-cols-2 gap-8">
                                        <div className="space-y-2 col-span-2">
                                            <Label htmlFor="title" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Titre de la formation</Label>
                                            <Input id="title" {...register("title")} className="h-14 rounded-2xl border-gray-100 bg-gray-50/50 focus:bg-white font-black text-xl transition-all" placeholder="Ex: Leadership Stratégique..." />
                                            {errors.title && <p className="text-xs font-bold text-red-500 ml-1">{errors.title.message}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="category" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Catégorie Thématique</Label>
                                            <Controller
                                                control={control}
                                                name="categoryId"
                                                render={({ field }) => (
                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                        <SelectTrigger className="h-12 rounded-xl border-gray-100 bg-gray-50/50 focus:bg-white font-bold transition-all">
                                                            <SelectValue placeholder="Sélectionner..." />
                                                        </SelectTrigger>
                                                        <SelectContent className="rounded-xl border-border shadow-xl">
                                                            {categories.map((c) => (
                                                                <SelectItem key={c.id} value={c.id} className="font-medium">{c.name}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                )}
                                            />
                                            {errors.categoryId && <p className="text-xs font-bold text-red-500 ml-1">{errors.categoryId.message}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="level" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Niveau Cible</Label>
                                            <Input id="level" {...register("level")} className="h-12 rounded-xl border-gray-100 bg-gray-50/50 focus:bg-white font-bold transition-all" placeholder="Ex: Management Intermédiaire..." />
                                            {errors.level && <p className="text-xs font-bold text-red-500 ml-1">{errors.level.message}</p>}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="description" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Présentation Commerciale</Label>
                                        <Textarea id="description" {...register("description")} className="min-h-[160px] rounded-[1.5rem] border-gray-100 bg-gray-50/50 focus:bg-white font-medium resize-none p-6 text-lg transition-all" placeholder="Décrivez les objectifs pédagogiques et la valeur ajoutée..." />
                                        {errors.description && <p className="text-xs font-bold text-red-500 ml-1">{errors.description.message}</p>}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="details" className="mt-0 focus-visible:ring-0 space-y-8 animate-in fade-in duration-300 w-full">
                            <div className="grid md:grid-cols-2 gap-8">
                                {/* Durée & Prix */}
                                <Card className="rounded-[2.5rem] border-none shadow-xl bg-white overflow-hidden">
                                    <CardHeader className="bg-gray-50/50 border-b border-gray-100/50 p-6">
                                        <CardTitle className="text-lg font-black flex items-center gap-2">
                                            <Settings className="h-5 w-5 text-gray-500" /> Logistique & Tarifs
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-6 space-y-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="duration" className="text-xs font-black uppercase text-muted-foreground ml-1">Durée Affichée</Label>
                                            <Input id="duration" {...register("duration")} className="h-12 rounded-xl border-gray-100 bg-gray-50/50" placeholder="Ex: 2 jours" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="durationType" className="text-xs font-black uppercase text-muted-foreground ml-1">Format de Session</Label>
                                            <Controller
                                                control={control}
                                                name="durationType"
                                                render={({ field }) => (
                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                        <SelectTrigger className="h-12 rounded-xl border-gray-100 bg-gray-50/50 font-bold">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent className="rounded-xl">
                                                            <SelectItem value="HALF_DAY">Matinée ou Après-midi</SelectItem>
                                                            <SelectItem value="FULL_DAY">Journée complète (6h+)</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                )}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="price" className="text-xs font-black uppercase text-muted-foreground ml-1">Tarif de Référence (€ HTVA)</Label>
                                            <div className="relative">
                                                <span className="absolute right-4 top-1/2 -translate-y-1/2 font-black text-gray-400">EUR</span>
                                                <Input id="price" type="number" step="0.01" {...register("price")} className="h-12 rounded-xl border-gray-100 bg-gray-50/50 font-black text-xl" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Expertise */}
                                <Card className="rounded-[2.5rem] border-none shadow-xl bg-white overflow-hidden flex flex-col">
                                    <CardHeader className="bg-amber-50/50 border-b border-amber-100/50 p-6">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-lg font-black flex items-center gap-2 text-amber-900">
                                                <Users className="h-5 w-5" /> Mode Expertise
                                            </CardTitle>
                                            <Controller
                                                control={control}
                                                name="isExpertise"
                                                render={({ field }) => (
                                                    <Switch
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                        className="data-[state=checked]:bg-amber-600"
                                                    />
                                                )}
                                            />
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-6 flex-1 flex flex-col">
                                        {!isExpertise ? (
                                            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3 opacity-40 italic">
                                                <Users className="h-12 w-12 text-gray-300" />
                                                <p className="text-sm font-medium">Tous les formateurs habilités sur la zone peuvent donner cette formation.</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
                                                <p className="text-xs font-bold text-amber-700 uppercase tracking-widest pl-1">Sélection restrictive</p>
                                                <ScrollArea className="h-48 rounded-2xl bg-gray-50 border border-gray-100 p-2">
                                                    <div className="space-y-1">
                                                        {trainers.map((trainer) => (
                                                            <div
                                                                key={trainer.id}
                                                                className={cn(
                                                                    "flex items-center gap-3 p-3 rounded-xl transition-all cursor-pointer group",
                                                                    authorizedTrainerIds?.includes(trainer.id) ? "bg-amber-100/50" : "hover:bg-white hover:shadow-sm"
                                                                )}
                                                                onClick={() => {
                                                                    const current = authorizedTrainerIds || [];
                                                                    if (current.includes(trainer.id)) {
                                                                        setValue("authorizedTrainerIds", current.filter(id => id !== trainer.id));
                                                                    } else {
                                                                        setValue("authorizedTrainerIds", [...current, trainer.id]);
                                                                    }
                                                                }}
                                                            >
                                                                <Checkbox
                                                                    checked={authorizedTrainerIds?.includes(trainer.id)}
                                                                    onCheckedChange={() => { }}
                                                                    className="border-amber-300 data-[state=checked]:bg-amber-600 data-[state=checked]:border-amber-600"
                                                                />
                                                                <span className="font-bold text-sm text-gray-700">{trainer.firstName} {trainer.lastName}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </ScrollArea>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Methodo & Inclusions */}
                            <Card className="rounded-[2.5rem] border-none shadow-xl bg-white overflow-hidden">
                                <CardContent className="p-8 grid md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <Label htmlFor="methodology" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Démarche Pédagogique</Label>
                                        <Textarea id="methodology" {...register("methodology")} className="h-40 rounded-2xl border-gray-100 bg-gray-50/50 p-4 text-sm font-medium resize-none" placeholder="Ex: 70/20/10, Role plays, Brainstorming..." />
                                    </div>
                                    <div className="space-y-3">
                                        <Label htmlFor="inclusions" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Matériel & Livrables</Label>
                                        <Textarea id="inclusions" {...register("inclusions")} className="h-40 rounded-2xl border-gray-100 bg-gray-50/50 p-4 text-sm font-bold border-dashed border-2 resize-none" placeholder="Ex: Support de cours PDF, Accès plateforme, Certificat..." />
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="media" className="mt-0 focus-visible:ring-0 space-y-8 animate-in fade-in duration-300 w-full">
                            {/* Images et Liens */}
                            <Card className="rounded-[2.5rem] border-none shadow-xl bg-white overflow-hidden">
                                <CardHeader className="bg-blue-600 border-b border-blue-700 p-8">
                                    <CardTitle className="text-xl font-black text-white flex items-center gap-3">
                                        <ImageIcon className="h-5 w-5" /> Assets Numériques
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-8 space-y-6">
                                    <div className="grid gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="imageUrl" className="text-xs font-black uppercase text-gray-400 ml-1 tracking-widest">Image de couverture (URL)</Label>
                                            <Input id="imageUrl" {...register("imageUrl")} placeholder="https://cdn.example.com/cover.jpg" className="h-12 border-gray-100 bg-gray-50/50 rounded-xl font-mono text-xs" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="programLink" className="text-xs font-black uppercase text-gray-400 ml-1 tracking-widest">Lien Programme (PDF/Web)</Label>
                                            <Input id="programLink" {...register("programLink")} placeholder="https://docs.example.com/formation-prog.pdf" className="h-12 border-gray-100 bg-gray-50/50 rounded-xl font-mono text-xs" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Agréments */}
                            <Card className="rounded-[2.5rem] border-none shadow-xl bg-white overflow-hidden">
                                <CardHeader className="bg-gray-50/50 border-b border-gray-100/50 p-8">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="text-xl font-black text-gray-900 tracking-tight">Agréments & Subsides</CardTitle>
                                            <p className="text-xs text-muted-foreground font-medium mt-1 uppercase tracking-widest">Codes KMO-Portefeuille, Wallonie, etc.</p>
                                        </div>
                                        <Button type="button" variant="outline" size="sm" onClick={addAgreement} className="rounded-xl font-black text-[10px] uppercase border-gray-200 h-10 px-4">
                                            <Plus className="h-3 w-3 mr-2" /> Ajouter un code
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-8">
                                    {agreements.length === 0 ? (
                                        <div className="text-center p-12 border-2 border-dashed border-gray-100 rounded-3xl text-muted-foreground/40 font-black uppercase text-[10px] tracking-[0.2em] bg-gray-50/30">
                                            Aucun agrément spécifié
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {agreements.map((agreement, index) => (
                                                <div key={index} className="flex gap-4 items-center bg-gray-50 p-3 pr-6 rounded-2xl border border-gray-100 group transition-all hover:bg-white hover:shadow-md animate-in slide-in-from-right-4 duration-300">
                                                    <div className="h-10 w-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-primary font-black text-xs shrink-0 border border-slate-100">
                                                        {index + 1}
                                                    </div>
                                                    <Input
                                                        placeholder="Entité (ex: Région Wallonne)"
                                                        value={agreement.region}
                                                        onChange={(e) => updateAgreement(index, 'region', e.target.value)}
                                                        className="h-12 border-transparent bg-transparent focus:bg-white transition-all font-bold rounded-xl flex-1"
                                                    />
                                                    <div className="w-px h-8 bg-gray-200 shrink-0"></div>
                                                    <Input
                                                        placeholder="Code Agrément"
                                                        value={agreement.code}
                                                        onChange={(e) => updateAgreement(index, 'code', e.target.value)}
                                                        className="h-12 border-transparent bg-transparent focus:bg-white transition-all font-mono text-sm rounded-xl w-48"
                                                    />
                                                    <Button type="button" variant="ghost" size="icon" onClick={() => removeAgreement(index)} className="h-10 w-10 hover:bg-red-50 hover:text-red-600 rounded-xl opacity-0 group-hover:opacity-100 transition-all shrink-0">
                                                        <Trash2 className="h-5 w-5" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Barre d'Actions Flottante Stable */}
                        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[calc(100%-4rem)] max-w-5xl z-50">
                            <div className="p-6 bg-white/80 border border-white/40 backdrop-blur-xl rounded-[2.5rem] shadow-2xl flex justify-between items-center px-10 border-t">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => router.back()}
                                    className="rounded-2xl font-black text-xs uppercase tracking-widest h-14 px-8 text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all"
                                >
                                    <X className="mr-3 h-5 w-5" /> Abandonner
                                </Button>
                                <div className="flex items-center gap-6">
                                    {activeTab !== "media" && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="rounded-2xl font-black text-xs uppercase tracking-widest h-14 px-8 border-slate-200 hover:bg-slate-50"
                                            onClick={() => {
                                                const tabs = ["general", "details", "media"];
                                                const next = tabs[tabs.indexOf(activeTab) + 1];
                                                setActiveTab(next);
                                            }}
                                        >
                                            Suivant <ChevronRight className="ml-3 h-5 w-5" />
                                        </Button>
                                    )}
                                    <Button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="rounded-2xl font-black text-xs uppercase tracking-[0.2em] h-14 px-12 shadow-2xl shadow-primary/30 hover:shadow-primary/40 transition-all bg-primary hover:scale-[1.02] active:scale-[0.98]"
                                    >
                                        {isSubmitting ? (
                                            <div className="flex items-center gap-3">
                                                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Synchronisation...
                                            </div>
                                        ) : (
                                            <>
                                                <Save className="mr-3 h-5 w-5" />
                                                {isEdit ? 'Mettre à jour la formation' : 'Lancer la formation'}
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Tabs>
        </form>
    );
}
