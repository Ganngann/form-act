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

  // TrainerId is now optional (Manual Request)
  if (!formationId || !date || !slot) {
      return (
          <div className="container mx-auto py-10">
              <h1 className="text-2xl font-bold text-red-500">Erreur de réservation</h1>
              <p>Il manque des informations pour finaliser la réservation.</p>
          </div>
      )
  }

  return (
    <div className="container mx-auto py-10 px-4 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">
          {trainerId ? "Finaliser votre réservation" : "Demande de prise en charge"}
      </h1>
      <div className="bg-secondary/20 p-4 rounded-lg mb-8">
          <h2 className="font-semibold">Récapitulatif</h2>
          <p>Date: {date}</p>
          <p>Créneau: {slot}</p>
          {!trainerId && (
              <p className="text-amber-600 font-medium mt-2">
                  ⚠️ Aucun formateur sélectionné. Votre demande sera traitée manuellement par notre équipe.
              </p>
          )}
      </div>

      <CheckoutForm
        formationId={formationId}
        trainerId={trainerId || ""} // Pass empty string if undefined
        date={date}
        slot={slot}
      />
    </div>
  )
}
