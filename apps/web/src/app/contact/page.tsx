import { ContactForm } from "@/components/contact-form";
import { Card, CardContent } from "@/components/ui/card";
import {
  Mail,
  Phone,
  MapPin,
  MessageSquare,
  Linkedin,
  Facebook,
  Twitter,
} from "lucide-react";

export const metadata = {
  title: "Contactez-nous | Form-Act",
  description:
    "Prenez contact avec l'équipe Form-Act pour vos besoins en formation.",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-24 px-4 overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-primary/5 -z-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent"></div>
        <div className="container mx-auto text-center max-w-4xl">
          <span className="inline-block px-3 py-1 rounded-md bg-white border border-border text-[10px] font-black uppercase tracking-widest text-primary mb-6 shadow-sm">
            Support & Renseignements
          </span>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 leading-[0.9]">
            Discutons de votre <br />
            <span className="text-primary italic">Projet.</span>
          </h1>
          <p className="text-xl text-muted-foreground font-medium max-w-2xl mx-auto leading-relaxed">
            Une question sur une formation ? Besoin d&apos;un devis personnalisé
            ? Notre équipe est à votre écoute pour vous accompagner.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-20 -mt-10 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
          {/* Info Sidebar (Left) */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="rounded-[2rem] border-border shadow-lg shadow-black/5 overflow-hidden group hover:border-primary/50 transition-colors">
              <CardContent className="p-8 space-y-8">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-6">
                    Coordonnées
                  </h3>
                  <ul className="space-y-6">
                    <li className="flex items-start gap-4">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        <MapPin className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-bold text-lg">Siège Social</p>
                        <p className="text-muted-foreground leading-relaxed">
                          123 Avenue de la Formation,
                          <br />
                          1000 Bruxelles, Belgique
                        </p>
                      </div>
                    </li>
                    <li className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        <Phone className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-bold text-lg">Téléphone</p>
                        <a
                          href="tel:+3221234567"
                          className="text-muted-foreground hover:text-primary transition-colors"
                        >
                          +32 2 123 45 67
                        </a>
                      </div>
                    </li>
                    <li className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        <Mail className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-bold text-lg">Email</p>
                        <a
                          href="mailto:contact@form-act.com"
                          className="text-muted-foreground hover:text-primary transition-colors"
                        >
                          contact@form-act.com
                        </a>
                      </div>
                    </li>
                  </ul>
                </div>

                <div className="pt-8 border-t border-border">
                  <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-4">
                    Réseaux Sociaux
                  </h3>
                  <div className="flex gap-2">
                    {[Linkedin, Twitter, Facebook].map((Icon, i) => (
                      <a
                        key={i}
                        href="#"
                        className="h-12 w-12 rounded-xl border border-border flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-white hover:border-primary transition-all"
                      >
                        <Icon className="h-5 w-5" />
                      </a>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="bg-primary text-white p-8 rounded-[2rem] shadow-xl shadow-primary/30 relative overflow-hidden">
              <div className="relative z-10">
                <MessageSquare className="h-8 w-8 mb-4 opacity-80" />
                <h3 className="text-2xl font-black tracking-tight mb-2">
                  Besoin d&apos;aide immédiate ?
                </h3>
                <p className="text-white/80 font-medium mb-6">
                  Consultez notre FAQ pour trouver des réponses rapides aux
                  questions fréquentes.
                </p>
                <a
                  href="/faq"
                  className="inline-flex items-center font-bold text-sm bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors backdrop-blur-sm"
                >
                  Voir la FAQ
                </a>
              </div>
              {/* Decorative circles */}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
            </div>
          </div>

          {/* Contact Form (Right) */}
          <div className="lg:col-span-3">
            <Card className="rounded-[2rem] border-border shadow-sm overflow-hidden bg-white/50 backdrop-blur-sm">
              <CardContent className="p-8 md:p-12">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold mb-2">
                    Envoyez-nous un message
                  </h2>
                  <p className="text-muted-foreground">
                    Remplissez le formulaire ci-dessous et nous vous répondrons
                    dans les plus brefs délais.
                  </p>
                </div>
                <ContactForm />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
