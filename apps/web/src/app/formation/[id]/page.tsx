import { BookingWidget } from "@/components/booking-widget"
import { notFound } from "next/navigation"

async function getFormation(id: string) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
  const res = await fetch(`${API_URL}/formations/${id}`, { cache: "no-store" })
  if (!res.ok) return undefined
  return res.json()
}

export default async function FormationPage({ params }: { params: { id: string } }) {
  const formation = await getFormation(params.id)

  if (!formation) {
    notFound()
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <h1 className="text-3xl font-bold">{formation.title}</h1>
          <div className="flex gap-4 text-sm text-muted-foreground">
             <span className="bg-secondary px-2 py-1 rounded">{formation.category?.name}</span>
             <span className="bg-secondary px-2 py-1 rounded">{formation.duration}</span>
             <span className="bg-secondary px-2 py-1 rounded">{formation.level}</span>
          </div>
          <div className="prose max-w-none">
            <h2 className="text-xl font-semibold">Description</h2>
            <p>{formation.description}</p>
            {/* Mocked content for better look */}
            <h2 className="text-xl font-semibold mt-4">Objectifs</h2>
            <ul className="list-disc pl-5">
                <li>Comprendre les concepts fondamentaux</li>
                <li>Mettre en pratique via des exercices</li>
                <li>Obtenir une certification</li>
            </ul>
          </div>
        </div>
        <div>
          <BookingWidget formation={formation} />
        </div>
      </div>
    </div>
  )
}
