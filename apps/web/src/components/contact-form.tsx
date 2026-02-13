"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Send } from "lucide-react"

const formSchema = z.object({
    name: z.string().min(2, "Nom requis"),
    email: z.string().email("Email invalide"),
    subject: z.string().min(5, "Sujet requis"),
    message: z.string().min(10, "Message trop court"),
})

type FormData = z.infer<typeof formSchema>

export function ContactForm() {
    const [submitting, setSubmitting] = useState(false)
    const [success, setSuccess] = useState(false)

    const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(formSchema)
    })

    const onSubmit = async (data: FormData) => {
        setSubmitting(true)
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, process.env.NODE_ENV === 'test' ? 0 : 1500))
        console.log("Form data:", data)
        setSubmitting(false)
        setSuccess(true)
        reset()
    }

    if (success) {
        return (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center animate-in fade-in zoom-in-95">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Send className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-green-800 mb-2">Message envoyé !</h3>
                <p className="text-green-700 font-medium">Merci de nous avoir contactés. Notre équipe reviendra vers vous sous 24h.</p>
                <Button onClick={() => setSuccess(false)} variant="outline" className="mt-6 border-green-200 text-green-700 hover:bg-green-100">
                    Envoyer un autre message
                </Button>
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Nom complet</label>
                    <Input id="name" {...register("name")} className="h-12 rounded-xl bg-muted/5 border-border" placeholder="Jean Dupont" />
                    {errors.name && <p className="text-red-500 text-xs font-bold mt-1">{errors.name.message}</p>}
                </div>
                <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Email</label>
                    <Input id="email" type="email" {...register("email")} className="h-12 rounded-xl bg-muted/5 border-border" placeholder="jean@exemple.com" />
                    {errors.email && <p className="text-red-500 text-xs font-bold mt-1">{errors.email.message}</p>}
                </div>
            </div>

            <div className="space-y-2">
                <label htmlFor="subject" className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Sujet</label>
                <Input id="subject" {...register("subject")} className="h-12 rounded-xl bg-muted/5 border-border" placeholder="Demande de renseignements..." />
                {errors.subject && <p className="text-red-500 text-xs font-bold mt-1">{errors.subject.message}</p>}
            </div>

            <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Message</label>
                <Textarea id="message" {...register("message")} className="min-h-[150px] rounded-xl bg-muted/5 border-border resize-none" placeholder="Comment pouvons-nous vous aider ?" />
                {errors.message && <p className="text-red-500 text-xs font-bold mt-1">{errors.message.message}</p>}
            </div>

            <Button type="submit" disabled={submitting} className="w-full h-14 text-lg font-black rounded-xl shadow-lg shadow-primary/20 transition-transform active:scale-95">
                {submitting ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Envoi en cours...</> : <><Send className="mr-2 h-5 w-5" /> Envoyer le message</>}
            </Button>
        </form>
    )
}
