import { CheckoutForm } from "@/components/checkout-form"
import { notFound } from "next/navigation"

interface CheckoutPageProps {
  searchParams: {
    formationId?: string
    trainerId?: string
    date?: string
    slot?: string
  }
}

export default function CheckoutPage({ searchParams }: CheckoutPageProps) {
  const { formationId, trainerId, date, slot } = searchParams

  if (!formationId || !trainerId || !date || !slot) {
      return (
          <div className="container mx-auto py-10">
              <h1 className="text-2xl font-bold text-red-500">Erreur de réservation</h1>
              <p>Il manque des informations pour finaliser la réservation.</p>
          </div>
      )
  }

  return (
    <div className="container mx-auto py-10 px-4 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Finaliser votre réservation</h1>
      <div className="bg-secondary/20 p-4 rounded-lg mb-8">
          <h2 className="font-semibold">Récapitulatif</h2>
          <p>Date: {date}</p>
          <p>Créneau: {slot}</p>
      </div>

      <CheckoutForm
        formationId={formationId}
        trainerId={trainerId}
        date={date}
        slot={slot}
      />
    </div>
  )
}
