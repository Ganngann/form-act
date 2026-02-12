import { CheckoutForm } from "@/components/checkout-form"
import { notFound, redirect } from "next/navigation"
import { cookies } from "next/headers"
import { jwtVerify } from "jose"
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

interface CheckoutPageProps {
  searchParams: {
    formationId?: string
    trainerId?: string
    date?: string
    slot?: string
  }
}

async function getFormation(id: string) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
  const res = await fetch(`${API_URL}/formations/${id}`, { cache: "no-store" })
  if (!res.ok) return undefined
  return res.json()
}

async function getTrainer(id: string) {
  if (!id) return null;
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
  const res = await fetch(`${API_URL}/trainers/${id}/public`, { cache: "no-store" })
  if (!res.ok) return undefined
  return res.json()
}

export default async function CheckoutPage({ searchParams }: CheckoutPageProps) {
  const { formationId, trainerId, date, slot } = searchParams

  const cookieStore = cookies()
  const token = cookieStore.get('Authentication')?.value
  let userRole = null

  if (token) {
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'super-secret-key')
      const { payload } = await jwtVerify(token, secret)
      userRole = payload.role as string
    } catch (error) {
      // Token invalid or expired
    }
  }

  // TrainerId is now optional (Manual Request)
  if (!formationId || !date || !slot) {
    return (
      <div className="container mx-auto py-20 text-center">
        <h1 className="text-3xl font-black text-destructive mb-4">Erreur de réservation</h1>
        <p className="text-muted-foreground mb-8">Il manque des informations pour finaliser la réservation.</p>
        <Button asChild>
          <Link href="/catalogue">Retour au catalogue</Link>
        </Button>
      </div>
    )
  }

  const formation = await getFormation(formationId)
  const trainer = trainerId ? await getTrainer(trainerId) : null

  if (!formation) {
    return (
      <div className="container mx-auto py-20 text-center">
        <h1 className="text-3xl font-black text-destructive mb-4">Formation introuvable</h1>
        <Button asChild>
          <Link href="/catalogue">Retour au catalogue</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/10 pb-20">
      <div className="bg-white border-b border-border py-8">
        <div className="container mx-auto px-4 max-w-3xl">
          <Button variant="ghost" size="sm" asChild className="mb-4 hover:bg-muted text-muted-foreground" >
            <Link href={`/formation/${formationId}`} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Retour à la formation
            </Link>
          </Button>
          <h1 className="text-3xl md:text-4xl font-black tracking-tighter">
            {trainerId ? "Finaliser votre réservation" : "Demande de prise en charge"}
          </h1>
          <p className="text-muted-foreground mt-2 font-medium">
            Vous êtes sur le point de réserver <span className="text-primary font-bold">{formation.title}</span>.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-3xl py-12">
        <CheckoutForm
          formationId={formationId}
          trainerId={trainerId || ""}
          date={date}
          slot={slot}
          isLoggedIn={!!userRole}
          formationTitle={formation.title}
          formationPrice={formation.price}
          trainerName={trainer ? `${trainer.firstName} ${trainer.lastName}` : undefined}
        />
      </div>
    </div>
  )
}
