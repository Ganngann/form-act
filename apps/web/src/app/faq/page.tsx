import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { HelpCircle, Search, FileText, Calendar, CreditCard, ShieldCheck } from "lucide-react"
import { Input } from "@/components/ui/input"

export const metadata = {
    title: "Foire Aux Questions | Form-Act",
    description: "Trouvez des réponses rapides à vos questions sur nos formations et services.",
}

const faqCategories = [
    {
        title: "Inscription & Réservation",
        icon: Calendar,
        items: [
            {
                q: "Comment s'inscrire à une formation ?",
                a: "L'inscription se fait directement en ligne via notre catalogue. Sélectionnez la formation souhaitée, choisissez une date disponible, et cliquez sur 'Réserver'. Si vous êtes déjà client, connectez-vous pour pré-remplir vos informations."
            },
            {
                q: "Puis-je annuler ou reporter ma session ?",
                a: "Oui, vous pouvez reporter sans frais jusqu'à 7 jours avant la date de la formation. Pour une annulation complète, merci de consulter nos conditions générales de vente ou de contacter le support."
            },
            {
                q: "Quels sont les prérequis pour les formations ?",
                a: "Chaque page de formation détaille les prérequis spécifiques dans la section 'À propos'. Certaines formations nécessitent un niveau technique de base, tandis que d'autres sont ouvertes à tous."
            }
        ]
    },
    {
        title: "Financement & Facturation",
        icon: CreditCard,
        items: [
            {
                q: "Acceptez-vous les chèques formation ?",
                a: "Oui, Form-Act est agréé pour les chèques formation de la Région Wallonne (Sodexo). Vous pouvez introduire votre demande après validation de votre inscription."
            },
            {
                q: "Quand recevrai-je ma facture ?",
                a: "La facture est envoyée automatiquement par email après la réalisation de la formation. Vous pouvez également la retrouver dans votre espace client sous l'onglet 'Facturation'."
            },
            {
                q: "Les tarifs incluent-ils la TVA ?",
                a: "Nos tarifs sont indiqués HTVA pour les professionnels. La TVA applicable (21%) est ajoutée lors de la facturation finale, sauf exemption légale spécifique."
            }
        ]
    },
    {
        title: "Logistique & Déroulement",
        icon: FileText,
        items: [
            {
                q: "Où se déroulent les formations ?",
                a: "Nos formations se déroulent soit dans nos centres partenaires, soit directement en entreprise (intramuros). Le lieu exact est confirmé dans votre email de convocation."
            },
            {
                q: "Recevrai-je un support de cours ?",
                a: "Absolument. Un support numérique complet est accessible via votre espace personnel dès le début de la formation. Certains modules incluent également des supports imprimés."
            },
            {
                q: "Une certification est-elle délivrée ?",
                a: "Oui, une attestation de participation est délivrée à l'issue de chaque formation. Pour les parcours certifiants, un examen peut être requis pour obtenir le certificat officiel."
            }
        ]
    }
]

export default function FAQPage() {
    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Hero Section */}
            <section className="relative py-24 px-4 overflow-hidden border-b border-border bg-white">
                <div className="absolute inset-0 bg-primary/5 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent"></div>
                <div className="container mx-auto text-center max-w-4xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest mb-6">
                        <HelpCircle className="h-4 w-4" /> Centre d&apos;aide
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-8 text-balance">
                        Questions <br />
                        <span className="text-primary">Fréquentes.</span>
                    </h1>

                    <div className="max-w-xl mx-auto relative group">
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        </div>
                        <Input
                            type="text"
                            placeholder="Rechercher une réponse..."
                            className="h-16 pl-12 rounded-2xl border-2 border-border bg-white shadow-xl shadow-primary/5 text-lg focus-visible:ring-0 focus-visible:border-primary transition-all"
                        />
                    </div>
                </div>
            </section>

            {/* FAQ Categories Grid */}
            <div className="container mx-auto px-4 py-16 max-w-5xl">
                <div className="grid gap-12">
                    {faqCategories.map((category, idx) => (
                        <div key={idx} className="scroll-m-20">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                    <category.icon className="h-6 w-6" />
                                </div>
                                <h2 className="text-2xl font-black tracking-tight">{category.title}</h2>
                            </div>

                            <Accordion type="single" collapsible className="w-full space-y-4">
                                {category.items.map((item, i) => (
                                    <AccordionItem key={i} value={`item-${idx}-${i}`} className="border border-border/60 rounded-2xl px-6 bg-white shadow-sm hover:border-primary/50 transition-all data-[state=open]:border-primary data-[state=open]:ring-1 data-[state=open]:ring-primary/20">
                                        <AccordionTrigger className="text-lg font-bold hover:no-underline py-6">
                                            {item.q}
                                        </AccordionTrigger>
                                        <AccordionContent className="text-muted-foreground text-base leading-relaxed pb-6">
                                            {item.a}
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        </div>
                    ))}
                </div>

                {/* Still Need Help Setup */}
                <div className="mt-20 p-12 bg-primary rounded-[2.5rem] text-center relative overflow-hidden shadow-2xl shadow-primary/30">
                    <div className="relative z-10 max-w-2xl mx-auto space-y-6">
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-4 text-white">
                            <ShieldCheck className="h-8 w-8" />
                        </div>
                        <h3 className="text-3xl font-black text-white tracking-tight">Vous ne trouvez pas votre réponse ?</h3>
                        <p className="text-white/80 text-lg font-medium">Notre équipe support est disponible pour vous aider à résoudre votre problème.</p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                            <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90 font-black h-14 px-8 rounded-xl shadow-lg">
                                <Link href="/contact">Nous Contacter</Link>
                            </Button>
                            <Button asChild variant="outline" size="lg" className="bg-transparent border-2 border-white/30 text-white hover:bg-white/10 hover:border-white font-bold h-14 px-8 rounded-xl">
                                <Link href="tel:+3221234567">Appeler le Support</Link>
                            </Button>
                        </div>
                    </div>

                    {/* Decorative Background Elements */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -ml-10 -mb-10"></div>
                </div>
            </div>
        </div>
    )
}
