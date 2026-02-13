import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { getJwtSecretKey } from '@/lib/auth.config';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { SearchHero } from '@/components/home/SearchHero';
import { BadgeCheck, Calendar, GraduationCap, Users, Shield, Zap, ArrowRight, Star, Quote } from 'lucide-react';

async function getCategories() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/categories`, {
      cache: 'no-store',
    });
    if (!res.ok) {
      console.error('Failed to fetch categories:', res.statusText);
      return [];
    }
    return res.json();
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

async function getUserRole() {
  const cookieStore = cookies();
  const token = cookieStore.get('Authentication')?.value;
  if (!token) return null;

  try {
    const secret = getJwtSecretKey();
    const { payload } = await jwtVerify(token, secret);
    return payload.role as string;
  } catch (error) {
    return null;
  }
}

export default async function Home() {
  const categories = await getCategories();
  const userRole = await getUserRole();

  return (
    <main className="flex flex-col gap-24 pb-32">
      {/* Hero Section */}
      <section className="container pt-20 px-4 md:pt-32">
        <div className="flex flex-col items-center text-center max-w-5xl mx-auto">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-[11px] font-black uppercase tracking-[3px] text-primary mb-8 animate-in fade-in slide-in-from-bottom-2">
            The Signature of Expertise
          </span>
          <h1 className="text-6xl sm:text-9xl font-bold tracking-tighter leading-[0.8] mb-10 text-balance animate-in fade-in slide-in-from-bottom-4 duration-700">
            Activez votre <br />
            <span className="text-primary italic">Expertise.</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground/80 max-w-2xl mb-14 leading-relaxed font-medium animate-in fade-in slide-in-from-bottom-6 duration-1000">
            La puissance du réseau Form-Act dans une interface moderne pour propulser vos talents vers de nouveaux sommets.
          </p>

          <div className="flex flex-col items-center gap-8 w-full animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <SearchHero categories={categories} />

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-4">
              <Button asChild size="lg" className="h-16 px-10 text-lg font-black rounded-2xl shadow-2xl shadow-primary/20 transition-all hover:scale-105 active:scale-95">
                <Link href="/catalogue" className="flex items-center gap-2">
                  Nos Formations <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild className="h-16 px-10 text-lg font-black border-2 border-border rounded-2xl hover:bg-primary/5 hover:border-primary transition-all hover:scale-105 active:scale-95">
                <Link href={userRole ? "/dashboard" : "/login"}>
                  {userRole ? "Mon Dashboard" : "Accès Client"}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Bento Grid Preview (Conditional) */}
      <section className="container px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 auto-rows-[220px]">
          {/* Main Preview Card */}
          {userRole ? (
            <div className="md:col-span-2 md:row-span-2 p-10 bg-white border border-border rounded-[3rem] flex flex-col justify-between group hover:border-primary transition-all duration-500 shadow-sm relative overflow-hidden">
              <div className="absolute top-4 right-4 z-20">
                <span className="px-2 py-1 rounded bg-primary/10 text-primary text-[8px] font-black uppercase tracking-widest border border-primary/20">Connecté</span>
              </div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              <div className="relative z-10">
                <span className="text-[10px] font-black text-primary uppercase tracking-[2px]">Aperçu de votre espace</span>
                <h3 className="text-4xl font-bold mt-4 leading-tight group-hover:text-primary transition-colors">Digital Strategy & <br />Product Management</h3>
                <p className="text-muted-foreground mt-4 font-medium max-w-xs">Programmé pour le mois prochain. Vous pouvez déjà consulter les ressources.</p>
              </div>

              <div className="relative z-10 flex items-center gap-5 mt-12">
                <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center border border-border/50 shadow-inner">
                  <GraduationCap className="h-7 w-7 text-muted-foreground/40" />
                </div>
                <div>
                  <p className="font-black text-xl">Sophie Durand</p>
                  <p className="text-sm font-bold text-muted-foreground/60 uppercase tracking-widest">Expert Senior Strategy</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="md:col-span-2 md:row-span-2 p-12 bg-primary border-[1px] border-primary rounded-[3rem] flex flex-col justify-between group overflow-hidden relative shadow-2xl shadow-primary/30">
              <div className="relative z-10">
                <span className="text-[10px] font-black text-white/50 uppercase tracking-[2px]">Le Futur de la Formation</span>
                <h3 className="text-5xl font-bold mt-4 leading-tight text-white mb-6 tracking-tighter">Plateforme n°1 <br />des Experts d&apos;Élite</h3>
                <p className="text-white/80 font-medium text-lg max-w-sm mb-8">Accédez à des programmes exclusifs et gérez votre croissance dans une interface pensée pour la performance.</p>
              </div>
              <Button asChild variant="secondary" className="bg-white text-primary hover:bg-white/90 font-black rounded-2xl h-16 w-fit relative z-10 px-10 transition-transform hover:scale-105 text-lg">
                <Link href="/login">Rejoindre le Réseau <BadgeCheck className="ml-2 h-6 w-6" /></Link>
              </Button>
              <div className="absolute -bottom-20 -right-20 h-80 w-80 bg-white/10 rounded-full blur-3xl"></div>
            </div>
          )}

          {/* Action Required Card / Value Proposition */}
          <div className="md:col-span-2 p-8 bg-orange-50/30 border border-orange-100 rounded-[3.5rem] flex items-center justify-between group hover:border-primary transition-all">
            <div className="flex items-center gap-6">
              <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center text-white shadow-xl shadow-primary/30 shrink-0">
                <p className="font-black text-3xl">!</p>
              </div>
              <div>
                <h4 className="text-2xl font-bold tracking-tight">{userRole ? "Dossier incomplet" : "Demande de Devis"}</h4>
                <p className="text-muted-foreground mt-1 max-w-[240px] font-medium leading-tight">
                  {userRole
                    ? "Veuillez envoyer la liste des participants pour valider votre session."
                    : "Recevez une proposition personnalisée en moins de 24 heures."}
                </p>
              </div>
            </div>
            <Button asChild size="icon" className="h-14 w-14 rounded-2xl bg-white text-primary hover:bg-white/90 border border-orange-100 shadow-sm shrink-0">
              <Link href={userRole ? "/dashboard" : "mailto:contact@form-act.com"}>
                <ArrowRight className="h-6 w-6" />
              </Link>
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="p-8 bg-white border border-border rounded-[3rem] flex flex-col justify-center items-center text-center group hover:border-primary transition-colors shadow-sm">
            <Users className="h-6 w-6 text-primary mb-3" />
            <span className="text-5xl font-black tracking-tighter">542</span>
            <p className="text-[10px] uppercase font-black text-muted-foreground/40 mt-1 tracking-widest">Experts Certifiés</p>
          </div>

          <div className="p-8 bg-white border border-border rounded-[3rem] flex flex-col justify-center items-center text-center group hover:border-primary transition-colors shadow-sm">
            <Star className="h-6 w-6 text-primary mb-3 fill-primary/10" />
            <span className="text-5xl font-black tracking-tighter">98%</span>
            <p className="text-[10px] uppercase font-black text-muted-foreground/40 mt-1 tracking-widest">Satisfaction</p>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="container px-4 py-12">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-16">
          <div className="max-w-2xl">
            <span className="text-[10px] font-black text-primary uppercase tracking-[3px]">Explorez le savoir</span>
            <h2 className="text-5xl md:text-7xl font-bold tracking-tighter mt-4 leading-[0.9]">Toutes nos <br /><span className="text-primary italic">Thématiques.</span></h2>
          </div>
          <Button variant="link" className="text-lg font-black p-0 h-auto text-primary" asChild>
            <Link href="/catalogue">Voir tout le catalogue <ArrowRight className="ml-2 h-5 w-5" /></Link>
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.slice(0, 12).map((category: any) => (
            <Link
              key={category.id}
              href={`/catalogue?categoryId=${category.id}`}
              className="group p-6 bg-white border border-border rounded-[2rem] hover:border-primary hover:bg-primary/[0.02] transition-all flex flex-col items-center justify-center text-center h-48"
            >
              <div className="h-12 w-12 rounded-2xl bg-primary/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <GraduationCap className="h-6 w-6 text-primary" />
              </div>
              <p className="font-bold text-sm tracking-tight leading-tight px-2">{category.name}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Value Pillars */}
      <section className="container px-4 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="flex flex-col gap-6">
            <div className="h-14 w-14 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20">
              <Shield className="h-7 w-7" />
            </div>
            <h3 className="text-3xl font-bold tracking-tight">Qualiopi & <br />Certifications</h3>
            <p className="text-muted-foreground font-medium leading-relaxed">Toutes nos formations répondent aux référentiels de qualité les plus exigeants pour garantir votre satisfaction et vos financements.</p>
          </div>
          <div className="flex flex-col gap-6">
            <div className="h-14 w-14 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20">
              <Users className="h-7 w-7" />
            </div>
            <h3 className="text-3xl font-bold tracking-tight">Réseau d&apos;Experts <br />Indépendants</h3>
            <p className="text-muted-foreground font-medium leading-relaxed">Un accès direct aux meilleurs formateurs du marché, sélectionnés pour leur expertise technique et leur pédagogie innovante.</p>
          </div>
          <div className="flex flex-col gap-6">
            <div className="h-14 w-14 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20">
              <Zap className="h-7 w-7" />
            </div>
            <h3 className="text-3xl font-bold tracking-tight">Tracking & <br />Reporting Live</h3>
            <p className="text-muted-foreground font-medium leading-relaxed">Suivez l&apos;impact de vos formations en temps réel grâce à notre dashboard intelligent et nos outils de reporting automatisés.</p>
          </div>
        </div>
      </section>

      {/* Trust Quote */}
      <section className="bg-primary/5 py-24 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>
        <div className="container px-4 flex flex-col items-center text-center">
          <Quote className="h-12 w-12 text-primary/20 mb-8" />
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight max-w-4xl text-balance italic">
            &quot;Form-Act a radicalement changé notre approche de la formation continue. La qualité des intervenants est simplement inégalée.&quot;
          </h2>
          <div className="mt-10">
            <p className="font-black text-xl">Julien Morel</p>
            <p className="text-sm font-bold text-muted-foreground uppercase tracking-[3px] mt-2">DRH — TechCorp Solutions</p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="container px-4 py-20">
        <div className="bg-primary rounded-[4rem] p-12 md:p-32 text-center text-white relative overflow-hidden group">
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
          <div className="relative z-10 flex flex-col items-center">
            <h2 className="text-5xl md:text-8xl font-black tracking-tighter mb-10 leading-[0.85]">
              Prêt à transformer <br />vos équipes ?
            </h2>
            <div className="flex flex-col sm:flex-row gap-6 mt-4">
              <Button asChild size="lg" variant="secondary" className="h-16 px-12 text-lg font-black rounded-2xl hover:bg-white hover:text-primary transition-all">
                <a href="mailto:contact@form-act.com">Demander un Devis</a>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-16 px-12 text-lg font-black border-2 border-white/30 text-white rounded-2xl bg-white/5 backdrop-blur-sm hover:bg-white/10 hover:border-white transition-all">
                <Link href="/catalogue">Explorer le Catalogue</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
