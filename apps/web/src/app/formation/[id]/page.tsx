import { BookingWidget } from "@/components/booking-widget"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { API_URL } from "@/lib/config"
import { Download, CheckCircle2, Clock, BookOpen, BarChart3, HelpCircle, ShieldCheck, Check } from "lucide-react"
import Link from "next/link"

async function getFormation(id: string) {
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
    <div className="min-h-screen pb-20">
      {/* Hero Header with Blurred Background */}
      <div className="relative bg-muted/20 border-b border-border overflow-hidden">
        {formation.imageUrl && (
          <div className="absolute inset-0 z-0 opacity-10 blur-3xl scale-110">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={formation.imageUrl} alt="" className="w-full h-full object-cover" />
          </div>
        )}

        <div className="container mx-auto px-4 py-16 relative z-10">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="flex-1 space-y-6">
              <div className="flex flex-wrap gap-2 animate-in fade-in slide-in-from-bottom-2">
                <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-primary/20">
                  {formation.category?.name || "Formation"}
                </span>
                {(agreements.length > 0) && (
                  <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100 flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3" /> Certifié Qualiopi
                  </span>
                )}
              </div>

              <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-[0.9] text-balance max-w-4xl text-foreground">
                {formation.title}
              </h1>

              <div className="flex flex-wrap gap-6 pt-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-white border border-border flex items-center justify-center text-primary shadow-sm">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="block text-[10px] font-black text-muted-foreground uppercase opacity-60">Durée</span>
                    <span className="font-bold text-sm">{formation.duration}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-white border border-border flex items-center justify-center text-primary shadow-sm">
                    <BarChart3 className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="block text-[10px] font-black text-muted-foreground uppercase opacity-60">Niveau</span>
                    <span className="font-bold text-sm">{formation.level}</span>
                  </div>
                </div>
              </div>
            </div>

            {formation.imageUrl && (
              <div className="w-full md:w-1/3 hidden md:block">
                <div className="rounded-[2rem] overflow-hidden shadow-2xl border-[4px] border-white rotate-1 hover:rotate-0 transition-transform duration-500">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={formation.imageUrl} alt={formation.title} className="w-full h-full object-cover aspect-[4/3]" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">

            {/* Description */}
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              <h2 className="text-2xl font-bold tracking-tight mb-6 flex items-center gap-2">
                <BookOpen className="h-6 w-6 text-primary" />
                À propos du cours
              </h2>
              <div className="prose prose-lg prose-neutral max-w-none text-muted-foreground leading-relaxed">
                <p className="whitespace-pre-line">{formation.description}</p>
              </div>
            </section>

            {/* Methodology & Inclusions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
              {(formation.methodology) && (
                <div className="bg-white p-8 rounded-[2rem] border border-border shadow-sm">
                  <h3 className="font-bold text-xl mb-4">Méthodologie</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line">{formation.methodology}</p>
                </div>
              )}
              {(formation.inclusions) && (
                <div className="bg-white p-8 rounded-[2rem] border border-border shadow-sm">
                  <h3 className="font-bold text-xl mb-4">Ce qui est inclus</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line">{formation.inclusions}</p>
                </div>
              )}
            </div>

            {/* Agreements */}
            {agreements.length > 0 && (
              <section className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 flex flex-col md:flex-row gap-8 items-start animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="flex-1">
                  <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
                    <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                    Financements & Agréments
                  </h2>
                  <p className="text-slate-600 text-sm mb-6">Cette formation est éligible à plusieurs types de financements régionaux. Voici les codes à fournir lors de votre demande.</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {agreements.map((agreement, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-white px-4 py-3 rounded-xl border border-border">
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{agreement.region}</span>
                        <span className="font-mono font-bold text-foreground bg-slate-100 px-2 py-0.5 rounded text-sm">
                          {agreement.code}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* Program Download */}
            {formation.programLink && (
              <div className="flex p-8 bg-primary/5 rounded-[2rem] border border-primary/10 items-center justify-between gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div>
                  <h3 className="font-bold text-lg text-primary">Programme détaillé</h3>
                  <p className="text-sm text-muted-foreground">Téléchargez le syllabus complet au format PDF.</p>
                </div>
                <a href={formation.programLink} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="gap-2 rounded-xl h-12 border-primary/20 text-primary hover:bg-white hover:border-primary">
                    <Download className="h-4 w-4" />
                    Télécharger
                  </Button>
                </a>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-1000">
            <div className="sticky top-8 space-y-8">
              {/* Booking Widget Container */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent blur-2xl -z-10 rounded-full opacity-50"></div>
                <BookingWidget formation={formation} />
              </div>

              {/* Contact / Help Card */}
              <div className="bg-white p-6 rounded-[2rem] border border-border shadow-sm text-center space-y-4">
                <div className="w-12 h-12 mx-auto rounded-full bg-muted flex items-center justify-center">
                  <HelpCircle className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">Une question ?</h4>
                  <p className="text-xs text-muted-foreground mt-1">Nos conseillers pédagogiques sont là pour vous aider à choisir.</p>
                </div>
                <Button variant="ghost" size="sm" className="w-full font-bold text-primary hover:bg-primary/5" asChild>
                  <a href="mailto:support@form-act.com">Contacter un conseiller</a>
                </Button>
              </div>

              {/* Guarantee */}
              <div className="flex items-center justify-center gap-2 text-xs font-medium text-muted-foreground/60">
                <ShieldCheck className="h-3 w-3" /> Paiement sécurisé & Facture pro
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
