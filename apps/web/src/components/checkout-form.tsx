"use client"
import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { API_URL } from "@/lib/config"
import { ROUTES } from "@/lib/routes"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Check, User, Building2, MapPin, Mail, Edit2, Loader2, ArrowRight } from "lucide-react"

const formSchema = z.object({
    vatNumber: z.string().min(4, "Numéro de TVA invalide"),
    companyName: z.string().min(2, "Nom de l'entreprise requis"),
    address: z.string().min(5, "Adresse requise"),
    email: z.string().email("Email invalide"),
    password: z.string().optional().or(z.string().min(8, "Mot de passe de 8 caractères minimum")),
})

type FormData = z.infer<typeof formSchema>

interface CheckoutFormProps {
    formationId: string
    trainerId: string
    date: string
    slot: string
    isLoggedIn?: boolean
    formationTitle?: string
    formationPrice?: string | number | null
    trainerName?: string
}

function CheckoutStepper({ step }: { step: number }) {
    return (
        <div className="flex items-center justify-center mb-10 w-full">
            <div className="relative flex items-center w-full max-w-sm">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 font-bold z-10 transition-colors ${step >= 1 ? 'bg-primary border-primary text-white' : 'bg-white border-border text-muted-foreground'}`}>
                    1
                </div>
                <div className={`flex-1 h-1 transition-colors ${step >= 2 ? 'bg-primary' : 'bg-border'}`}></div>
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 font-bold z-10 transition-colors ${step >= 2 ? 'bg-primary border-primary text-white' : 'bg-white border-border text-muted-foreground'}`}>
                    2
                </div>
            </div>
            <div className="absolute w-full max-w-sm flex justify-between top-12 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                <span className={step >= 1 ? "text-primary" : ""}>Coordonnées</span>
                <span className={step >= 2 ? "text-primary" : ""}>Confirmation</span>
            </div>
        </div>
    )
}

export function CheckoutForm({ formationId, trainerId, date, slot, isLoggedIn, formationTitle, formationPrice, trainerName }: CheckoutFormProps) {
    const pathname = usePathname()
    const router = useRouter()
    const [step, setStep] = useState(1)
    const [loadingVat, setLoadingVat] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState("")
    const [loadingProfile, setLoadingProfile] = useState(false)
    const [showProfileSummary, setShowProfileSummary] = useState(false) // Toggle for logged in users

    const { register, handleSubmit, setValue, getValues, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(formSchema)
    })

    useEffect(() => {
        if (isLoggedIn) {
            setLoadingProfile(true)
            fetch(`${API_URL}/auth/me`, { credentials: "include" })
                .then(res => res.json())
                .then(user => {
                    setValue("email", user.email)
                    if (user.client) {
                        setValue("vatNumber", user.client.vatNumber)
                        setValue("companyName", user.client.companyName)
                        setValue("address", user.client.address)
                        setShowProfileSummary(true) // Automatically show summary if data exists
                    }
                })
                .catch(err => console.error("Error fetching user profile:", err))
                .finally(() => setLoadingProfile(false))
        }
    }, [isLoggedIn, setValue])

    const checkVat = async () => {
        const vat = getValues("vatNumber")
        if (!vat || vat.length < 4) return;

        setLoadingVat(true)
        try {
            const res = await fetch(`${API_URL}/company/check-vat/${vat}`)
            if (!res.ok) throw new Error("Erreur vérification TVA")
            const data = await res.json()

            if (data.isValid) {
                setValue("companyName", data.companyName)
                setValue("address", data.address)
                setValue("vatNumber", data.vatNumber)
            } else {
                alert("Numéro de TVA non valide ou non trouvé dans VIES.")
            }
        } catch (e) {
            console.error(e)
            alert("Impossible de vérifier le numéro de TVA.")
        } finally {
            setLoadingVat(false)
        }
    }

    const onSubmitStep1 = (data: FormData) => {
        setStep(2)
        window.scrollTo(0, 0)
    }

    const handleConfirm = async () => {
        const data = getValues()
        setSubmitting(true)
        setError("")

        try {
            const payload = {
                ...data,
                formationId,
                trainerId: trainerId || undefined,
                date,
                slot
            }

            const res = await fetch(`${API_URL}/checkout`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            })

            if (!res.ok) {
                const errData = await res.json()
                throw new Error(errData.message || "Erreur lors de la réservation")
            }

            window.location.href = `${ROUTES.dashboard}?success=booking`

        } catch (e: unknown) {
            if (e instanceof Error) {
                setError(e.message)
            } else {
                setError("Une erreur inattendue est survenue")
            }
        } finally {
            setSubmitting(false)
        }
    }

    const labelClass = "text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2 block"

    // If logged in and showing summary (Step 1 variant)
    if (step === 1 && isLoggedIn && showProfileSummary && !loadingProfile) {
        const values = getValues()
        return (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <CheckoutStepper step={1} />
                <Card className="border-primary/20 bg-primary/5 rounded-[2rem] overflow-hidden">
                    <CardHeader className="bg-primary/10 border-b border-primary/10 p-6 flex flex-row items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center text-primary">
                                <User className="h-5 w-5" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-primary">Profil Client Identifié</h2>
                                <p className="text-xs text-primary/70">Nous utilisons vos informations enregistrées.</p>
                            </div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => setShowProfileSummary(false)} className="text-primary hover:bg-white/50">
                            <Edit2 className="h-4 w-4 mr-2" /> Modifier
                        </Button>
                    </CardHeader>
                    <CardContent className="p-8 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 text-muted-foreground">
                                    <Building2 className="h-5 w-5" />
                                    <span className="font-bold text-foreground">{values.companyName}</span>
                                </div>
                                <div className="flex items-center gap-3 text-muted-foreground">
                                    <div className="h-5 w-5 flex items-center justify-center font-bold text-xs border rounded">VAT</div>
                                    <span className="text-foreground">{values.vatNumber}</span>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 text-muted-foreground">
                                    <MapPin className="h-5 w-5" />
                                    <span className="text-foreground">{values.address}</span>
                                </div>
                                <div className="flex items-center gap-3 text-muted-foreground">
                                    <Mail className="h-5 w-5" />
                                    <span className="text-foreground">{values.email}</span>
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-primary/10 flex justify-end">
                            <Button onClick={() => setStep(2)} size="lg" className="rounded-xl font-bold shadow-lg shadow-primary/20">
                                Continuer avec ce profil <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (step === 2) {
        const data = getValues()
        return (
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
                <CheckoutStepper step={2} />
                <Card className="rounded-[2rem] border-border shadow-sm overflow-hidden">
                    <CardContent className="p-8 space-y-8">
                        <div className="flex items-start justify-between border-b pb-6">
                            <div>
                                <h2 className="text-2xl font-bold mb-1">Dernière étape</h2>
                                <p className="text-muted-foreground">Vérifiez les détails avant d&apos;envoyer votre demande.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-muted/10 p-6 rounded-2xl border border-border/50">
                                <h3 className="font-black text-sm uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-primary"></span>
                                    La Session
                                </h3>
                                <div className="space-y-3">
                                    <p className="text-lg font-bold">{formationTitle}</p>
                                    <div className="text-sm text-muted-foreground space-y-1">
                                        <p>Date : <span className="text-foreground font-medium">{date}</span></p>
                                        <p>Créneau : <span className="text-foreground font-medium">{slot}</span></p>
                                        <p>Formateur : <span className="text-foreground font-medium">{trainerName || "Non attribué (Sélection auto)"}</span></p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-muted/10 p-6 rounded-2xl border border-border/50">
                                <h3 className="font-black text-sm uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-primary"></span>
                                    Facturation
                                </h3>
                                <div className="space-y-3">
                                    <p className="font-bold text-lg">{data.companyName}</p>
                                    <div className="text-sm text-muted-foreground space-y-1">
                                        <p>{data.address}</p>
                                        <p>TVA: {data.vatNumber}</p>
                                        <p>{data.email}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
                            <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-2 text-blue-700 font-bold">
                                    Demande d&apos;offre tarifaire
                                </div>
                                <p className="text-xs text-blue-600/80 leading-relaxed">
                                    Une offre précise incluant les frais de déplacement vous sera envoyée pour validation avant confirmation.
                                </p>
                            </div>
                        </div>

                        {error && <div className="p-4 bg-red-50 text-red-600 rounded-xl font-medium border border-red-100">{error}</div>}

                        <div className="flex gap-4 pt-4">
                            <Button variant="ghost" onClick={() => setStep(1)} disabled={submitting} className="h-12 w-full md:w-auto font-bold text-muted-foreground hover:bg-muted">
                                Retour
                            </Button>
                            <Button onClick={handleConfirm} disabled={submitting} className="h-12 w-full md:w-auto flex-1 font-bold rounded-xl shadow-lg shadow-primary/20">
                                {submitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Envoi...</> : "Envoyer ma demande"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit(onSubmitStep1)} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <CheckoutStepper step={1} />

            {loadingProfile && (
                <div className="w-full h-40 flex items-center justify-center bg-muted/5 rounded-2xl border border-border">
                    <Loader2 className="h-8 w-8 text-primary/50 animate-spin" />
                </div>
            )}

            {!loadingProfile && (
                <>
                    <Card className="rounded-[2rem] border-border shadow-sm">
                        <CardHeader className="p-8 pb-4">
                            <h2 className="text-xl font-bold">Informations de facturation</h2>
                            {!isLoggedIn && <p className="text-muted-foreground text-sm">Remplissez ces informations pour générer votre facture.</p>}
                        </CardHeader>
                        <CardContent className="p-8 pt-4 space-y-6">
                            <div className="flex gap-4 items-end">
                                <div className="flex-1 space-y-1">
                                    <label htmlFor="vatNumber" className={labelClass}>Numéro de TVA</label>
                                    <Input id="vatNumber" {...register("vatNumber")} placeholder="BE0..." className="h-12 rounded-xl bg-muted/10 border-border" />
                                    {errors.vatNumber && <p className="text-sm text-red-500 font-medium">{errors.vatNumber.message}</p>}
                                </div>
                                <Button type="button" onClick={checkVat} disabled={loadingVat} variant="outline" className="h-12 px-6 rounded-xl border-border font-bold">
                                    {loadingVat ? <Loader2 className="h-4 w-4 animate-spin" /> : "Vérifier"}
                                </Button>
                            </div>

                            <div className="space-y-1">
                                <label htmlFor="companyName" className={labelClass}>Nom de l&apos;entreprise</label>
                                <Input id="companyName" {...register("companyName")} className="h-12 rounded-xl bg-muted/10 border-border" />
                                {errors.companyName && <p className="text-sm text-red-500 font-medium">{errors.companyName.message}</p>}
                            </div>

                            <div className="space-y-1">
                                <label htmlFor="address" className={labelClass}>Adresse complète</label>
                                <Input id="address" {...register("address")} className="h-12 rounded-xl bg-muted/10 border-border" />
                                {errors.address && <p className="text-sm text-red-500 font-medium">{errors.address.message}</p>}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-[2rem] border-border shadow-sm">
                        <CardHeader className="p-8 pb-4">
                            <h2 className="text-xl font-bold">Contact & Compte</h2>
                        </CardHeader>
                        <CardContent className="p-8 pt-4 space-y-6">
                            {!isLoggedIn && (
                                <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 flex justify-between items-center mb-4">
                                    <span className="text-sm font-bold text-blue-700">Vous avez déjà un compte ?</span>
                                    <Link
                                        href={`/login?redirect=${encodeURIComponent(pathname + window.location.search)}`}
                                        className="text-sm text-white bg-blue-600 hover:bg-blue-700 font-bold px-4 py-2 rounded-lg transition-colors"
                                    >
                                        Se connecter
                                    </Link>
                                </div>
                            )}
                            <div className="space-y-1">
                                <label htmlFor="email" className={labelClass}>Email professionnel</label>
                                <Input id="email" type="email" {...register("email")} className="h-12 rounded-xl bg-muted/10 border-border" />
                                {errors.email && <p className="text-sm text-red-500 font-medium">{errors.email.message}</p>}
                            </div>

                            {!isLoggedIn && (
                                <div className="space-y-1">
                                    <label htmlFor="password" className={labelClass}>Créer un mot de passe</label>
                                    <Input id="password" type="password" {...register("password")} className="h-12 rounded-xl bg-muted/10 border-border" />
                                    <p className="text-xs text-muted-foreground mt-1 ml-1">Ce mot de passe vous permettra de suivre vos formations.</p>
                                    {errors.password && <p className="text-sm text-red-500 font-medium">{errors.password.message}</p>}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {error && <div className="p-3 bg-red-100 text-red-700 rounded-xl">{error}</div>}

                    <Button type="submit" className="w-full h-14 text-lg font-black rounded-xl shadow-lg shadow-primary/20" disabled={submitting}>
                        {submitting ? "Traitement..." : "Vérifier et continuer"}
                    </Button>
                </>
            )}
        </form>
    )
}
