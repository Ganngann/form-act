import Link from "next/link";
import { getSiteConfig } from "@/lib/api-config";
import { GlobalConfig } from "@/types/configuration";
import { Facebook, Linkedin, Zap } from "lucide-react";

export async function Footer() {
  const config = await getSiteConfig<GlobalConfig>("global_settings");

  // Fallback defaults if config fails
  const data = config || {
    logoText: "FORM-ACT",
    email: "contact@form-act.com",
    phone: "",
    address: "",
    social: { linkedin: "", facebook: "" }
  };

  return (
    <footer className="bg-muted/30 border-t border-border mt-auto">
      <div className="container py-12 md:py-24 px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1 flex flex-col gap-6">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center transition-transform group-hover:scale-110">
                <Zap className="h-4 w-4 text-white fill-white" />
              </div>
              <span className="text-xl font-bold tracking-tighter text-foreground">
                {data.logoText}
              </span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
              La plateforme de référence pour les experts de la formation professionnelle.
            </p>
            <div className="flex gap-4">
              {data.social.linkedin && (
                <a href={data.social.linkedin} target="_blank" rel="noopener noreferrer" className="p-2 bg-background border rounded-lg hover:border-primary hover:text-primary transition-colors">
                  <Linkedin className="h-4 w-4" />
                </a>
              )}
              {data.social.facebook && (
                <a href={data.social.facebook} target="_blank" rel="noopener noreferrer" className="p-2 bg-background border rounded-lg hover:border-primary hover:text-primary transition-colors">
                  <Facebook className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>

          {/* Contact */}
          <div className="col-span-1">
            <h4 className="font-bold text-lg mb-6">Contact</h4>
            <div className="flex flex-col gap-4 text-sm text-muted-foreground font-medium">
              {data.address && <p className="whitespace-pre-line">{data.address}</p>}
              {data.email && <a href={`mailto:${data.email}`} className="hover:text-primary transition-colors">{data.email}</a>}
              {data.phone && <a href={`tel:${data.phone}`} className="hover:text-primary transition-colors">{data.phone}</a>}
            </div>
          </div>

          {/* Links */}
          <div className="col-span-1">
            <h4 className="font-bold text-lg mb-6">Navigation</h4>
            <nav className="flex flex-col gap-4 text-sm text-muted-foreground font-medium">
              <Link href="/catalogue" className="hover:text-primary transition-colors">Catalogue</Link>
              <Link href="/login" className="hover:text-primary transition-colors">Espace Client</Link>
              <Link href="/login" className="hover:text-primary transition-colors">Espace Formateur</Link>
            </nav>
          </div>

          {/* Legal */}
          <div className="col-span-1">
            <h4 className="font-bold text-lg mb-6">Légal</h4>
            <nav className="flex flex-col gap-4 text-sm text-muted-foreground font-medium">
              <Link href="/legal/mentions-legales" className="hover:text-primary transition-colors">Mentions Légales</Link>
              <Link href="/legal/cgv" className="hover:text-primary transition-colors">CGV</Link>
              <Link href="/legal/confidentialite" className="hover:text-primary transition-colors">Confidentialité</Link>
            </nav>
          </div>
        </div>

        <div className="border-t border-border mt-16 pt-8 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground font-medium">
            &copy; {new Date().getFullYear()} {data.logoText}. Tous droits réservés.
          </p>
          <p className="text-[10px] text-muted-foreground/50 uppercase tracking-widest font-bold">
            Designed with excellence
          </p>
        </div>
      </div>
    </footer>
  );
}
