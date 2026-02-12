import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { SearchHero } from '@/components/home/SearchHero';
import { BadgeCheck, Calendar, GraduationCap } from 'lucide-react';

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
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'super-secret-key');
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
    <main className="container py-20 px-4 md:py-32 overflow-hidden">
      {/* Hero Section */}
      <section className="relative mb-20">
        <div className="flex flex-col items-start text-left">
          <span className="inline-block px-3 py-1 rounded-md bg-primary/5 border border-primary text-[10px] font-bold uppercase tracking-widest text-primary mb-6">
            Next-Gen Training
          </span>
          <h1 className="text-6xl sm:text-8xl font-bold tracking-tighter leading-[0.9] mb-8 max-w-4xl text-balance">
            Activez votre <br />
            <span className="text-primary italic">Expertise.</span>
          </h1>
          <p className="text-xl text-muted-foreground/80 max-w-xl mb-12 leading-relaxed font-medium">
            La puissance du réseau Form-Act dans une interface moderne et lumineuse pour propulser vos talents vers de nouveaux sommets.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full justify-start items-center">
            <Button asChild size="lg" className="h-14 px-8 text-lg font-bold rounded-xl shadow-xl shadow-primary/20 transition-transform hover:-translate-y-1">
              <Link href="/catalogue">Explorer le Catalogue</Link>
            </Button>
            <Button variant="ghost" size="lg" asChild className="h-14 px-8 text-lg font-bold border-2 border-border rounded-xl hover:bg-primary/5 hover:border-primary transition-all">
              <Link href="/contact">Demander un Devis</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Bento Grid Preview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 auto-rows-[200px]">
        {/* Main Preview Card (Dynamic) */}
        {userRole ? (
          <div className="md:col-span-2 md:row-span-2 p-10 bg-white border border-border rounded-[2rem] flex flex-col justify-between group hover:border-primary transition-all duration-500 shadow-sm hover:translate-y-[-4px]">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-black text-primary uppercase tracking-[2px]">Ma prochaine formation</span>
                <h3 className="text-4xl font-bold mt-4 leading-tight">Leadership & <br />Intelligence Émotionnelle</h3>
              </div>
              <div className="bg-primary/5 text-primary px-3 py-1.5 rounded-lg font-mono text-sm font-bold border border-primary/20">
                J - 4
              </div>
            </div>

            <div className="flex items-center gap-4 mt-12 pb-2">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center border border-border">
                <GraduationCap className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <p className="font-bold text-lg">Marc Lefebvre</p>
                <p className="text-sm text-muted-foreground">Expert Certifié Management</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="md:col-span-2 md:row-span-2 p-10 bg-primary border-[1px] border-primary rounded-[2rem] flex flex-col justify-between group overflow-hidden relative shadow-2xl shadow-primary/30">
            <div className="relative z-10">
              <span className="text-[10px] font-black text-white/60 uppercase tracking-[2px]">Prêt à nous rejoindre ?</span>
              <h3 className="text-4xl font-bold mt-4 leading-tight text-white mb-6">Plateforme n°1 <br />des Formateurs d&apos;Élite</h3>
              <p className="text-white/80 font-medium max-w-sm mb-8">Accédez à des programmes exclusifs et gérez votre croissance dans une interface pensée pour la performance.</p>
            </div>
            <Button asChild className="bg-white text-primary hover:bg-white/90 font-black rounded-2xl h-14 w-fit relative z-10 px-8 transition-transform hover:scale-105">
              <Link href="/register">Créer mon compte <BadgeCheck className="ml-2 h-5 w-5" /></Link>
            </Button>
            {/* Background effect for marketing card */}
            <div className="absolute -bottom-10 -right-10 h-64 w-64 bg-white/10 rounded-full blur-3xl"></div>
          </div>
        )}

        {/* Action / Value Card */}
        {userRole ? (
          <div className="md:col-span-2 p-8 bg-orange-50/50 border border-primary/20 rounded-[2rem] flex flex-col justify-center hover:scale-[1.02] transition-transform">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                <p className="text-white font-black text-xl">!</p>
              </div>
              <h4 className="font-bold text-xl">Action Requise</h4>
            </div>
            <p className="text-muted-foreground mb-6 max-w-md">
              Il manque la liste des participants pour votre session du 18 Février.
            </p>
            <Button size="sm" className="w-fit font-bold rounded-lg shadow-md shadow-primary/10">Remplir maintenant</Button>
          </div>
        ) : (
          <div className="md:col-span-2 p-10 bg-white border border-border rounded-[2rem] flex flex-col justify-center group hover:border-primary transition-all shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-12 w-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary">
                <GraduationCap className="h-6 w-6" />
              </div>
              <h4 className="font-bold text-2xl tracking-tight">Large Catalogue de Compétences</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {['Management', 'Soft Skills', 'Technique', 'Web', 'IA'].map(tag => (
                <span key={tag} className="px-4 py-1.5 rounded-lg border border-border text-xs font-bold text-muted-foreground group-hover:border-primary/30 transition-colors uppercase tracking-wider">{tag}</span>
              ))}
            </div>
            <p className="mt-6 text-muted-foreground text-sm font-medium">Parcourez plus de 200 formations certifiées Qualiopi et adaptées à vos besoins.</p>
          </div>
        )}

        {/* Stats Card 1 (Public) */}
        <div className="p-8 bg-white border border-border rounded-[2rem] flex flex-col justify-center group hover:border-primary transition-colors shadow-sm">
          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[1px]">Formateurs</span>
          <p className="text-5xl font-bold my-2 group-hover:text-primary transition-colors tracking-tighter">542</p>
          <p className="text-xs text-muted-foreground font-medium">Experts sélectionnés</p>
        </div>

        {/* Stats Card 2 (Public) */}
        <div className="p-8 bg-white border border-border rounded-[2rem] flex flex-col justify-center group hover:border-primary transition-colors shadow-sm">
          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[1px]">Succès</span>
          <p className="text-5xl font-bold my-2 group-hover:text-primary transition-colors tracking-tighter">98%</p>
          <p className="text-xs text-muted-foreground font-medium">Satisfaction client</p>
        </div>
      </div>
    </main>
  );
}
