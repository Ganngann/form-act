"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { API_URL } from "@/lib/config"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"

const formSchema = z.object({
  vatNumber: z.string().min(4, "Numéro de TVA invalide"),
  companyName: z.string().min(2, "Nom de l'entreprise requis"),
  address: z.string().min(5, "Adresse requise"),
  email: z.string().email("Email invalide"),
  password: z.string().min(8, "Mot de passe de 8 caractères minimum"),
})

type FormData = z.infer<typeof formSchema>

interface CheckoutFormProps {
    formationId: string
    trainerId: string
    date: string
    slot: string
}

export function CheckoutForm({ formationId, trainerId, date, slot }: CheckoutFormProps) {
    const [loadingVat, setLoadingVat] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState("")

    const { register, handleSubmit, setValue, getValues, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(formSchema)
    })

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

    const onSubmit = async (data: FormData) => {
        setSubmitting(true)
        setError("")

        try {
            const payload = {
                ...data,
                formationId,
                trainerId,
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

            window.location.href = "/checkout/success"

        } catch (e: any) {
            setError(e.message)
        } finally {
            setSubmitting(false)
        }
    }

    const labelClass = "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Card>
                <CardContent className="pt-6 space-y-4">
                    <div className="flex gap-2 items-end">
                        <div className="flex-1 space-y-2">
                            <label htmlFor="vatNumber" className={labelClass}>Numéro de TVA (ex: BE0477472701)</label>
                            <Input id="vatNumber" {...register("vatNumber")} placeholder="BE..." />
                            {errors.vatNumber && <p className="text-sm text-red-500">{errors.vatNumber.message}</p>}
                        </div>
                        <Button type="button" onClick={checkVat} disabled={loadingVat}>
                            {loadingVat ? "..." : "Vérifier"}
                        </Button>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="companyName" className={labelClass}>Nom de l'entreprise</label>
                        <Input id="companyName" {...register("companyName")} />
                        {errors.companyName && <p className="text-sm text-red-500">{errors.companyName.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="address" className={labelClass}>Adresse</label>
                        <Input id="address" {...register("address")} />
                        {errors.address && <p className="text-sm text-red-500">{errors.address.message}</p>}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="pt-6 space-y-4">
                     <div className="space-y-2">
                        <label htmlFor="email" className={labelClass}>Email professionnel</label>
                        <Input id="email" type="email" {...register("email")} />
                        {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
                    </div>

                     <div className="space-y-2">
                        <label htmlFor="password" className={labelClass}>Mot de passe</label>
                        <Input id="password" type="password" {...register("password")} />
                        <p className="text-xs text-muted-foreground">Pour accéder à votre espace client ultérieurement.</p>
                        {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
                    </div>
                </CardContent>
            </Card>

            {error && <div className="p-3 bg-red-100 text-red-700 rounded">{error}</div>}

            <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Traitement..." : "Confirmer la réservation"}
            </Button>
        </form>
    )
}
