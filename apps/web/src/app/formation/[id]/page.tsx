import { BookingWidget } from "@/components/booking-widget"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Download, CheckCircle2 } from "lucide-react"

async function getFormation(id: string) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
  const res = await fetch(`${API_URL}/formations/${id}`, { cache: "no-store" })
  if (!res.ok) return undefined
  return res.json()
}

type Agreement = {
  region: string
  code: string
}

export default async function FormationPage({ params }: { params: { id: string } }) {
  const formation = await getFormation(params.id)

  if (!formation) {
    notFound()
  }

  let agreements: Agreement[] = []
  if (formation.agreementCodes) {
    try {
      agreements = JSON.parse(formation.agreementCodes)
    } catch (e) {
      console.error("Failed to parse agreement codes", e)
    }
  }

  return (
    <div className="container mx-auto py-10 px-4">
      {formation.imageUrl && (
        <div className="w-full h-64 md:h-96 relative mb-8 rounded-xl overflow-hidden shadow-md">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={formation.imageUrl}
            alt={formation.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <h1 className="text-3xl font-bold">{formation.title}</h1>

          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
             <span className="bg-secondary px-3 py-1 rounded-full">{formation.category?.name}</span>
             <span className="bg-secondary px-3 py-1 rounded-full">{formation.duration}</span>
             <span className="bg-secondary px-3 py-1 rounded-full">{formation.level}</span>
          </div>

          <div className="prose max-w-none space-y-6">
            <section>
              <h2 className="text-xl font-semibold mb-2">Description</h2>
              <p className="whitespace-pre-line">{formation.description}</p>
            </section>

            {(formation.methodology) && (
              <section>
                <h2 className="text-xl font-semibold mb-2">Méthodologie</h2>
                <p className="whitespace-pre-line">{formation.methodology}</p>
              </section>
            )}

            {(formation.inclusions) && (
               <section>
                <h2 className="text-xl font-semibold mb-2">Inclus</h2>
                <p className="whitespace-pre-line">{formation.inclusions}</p>
              </section>
            )}

            {/* Display Agreements if any */}
            {agreements.length > 0 && (
              <section className="bg-slate-50 p-4 rounded-lg border">
                <h2 className="text-lg font-semibold mb-3 flex items-center">
                  <CheckCircle2 className="mr-2 h-5 w-5 text-green-600" />
                  Agréments & Subsides
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {agreements.map((agreement, idx) => (
                    <div key={idx} className="flex flex-col">
                      <span className="text-sm font-medium text-slate-500">{agreement.region}</span>
                      <span className="text-md font-mono bg-white border px-2 py-1 rounded w-fit">
                        {agreement.code}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {formation.programLink && (
              <div className="pt-4">
                <a href={formation.programLink} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="gap-2">
                    <Download className="h-4 w-4" />
                    Télécharger le programme complet (PDF)
                  </Button>
                </a>
              </div>
            )}
          </div>
        </div>

        <div>
          <BookingWidget formation={formation} />
        </div>
      </div>
    </div>
  )
}
