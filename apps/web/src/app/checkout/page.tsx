import { CheckoutForm } from "@/components/checkout-form"
import { notFound } from "next/navigation"
import { cookies } from "next/headers"
import { jwtVerify } from "jose"

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
      <div className="container mx-auto py-10">
        <h1 className="text-2xl font-bold text-red-500">Erreur de réservation</h1>
        <p>Il manque des informations pour finaliser la réservation.</p>
      </div>
    )
  }

  const formation = await getFormation(formationId)
  const trainer = trainerId ? await getTrainer(trainerId) : null

  if (!formation) {
      return (
        <div className="container mx-auto py-10">
          <h1 className="text-2xl font-bold text-red-500">Formation introuvable</h1>
        </div>
      )
  }

  return (
    <div className="container mx-auto py-10 px-4 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">
        {trainerId ? "Finaliser votre réservation" : "Demande de prise en charge"}
      </h1>

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
  )
}
