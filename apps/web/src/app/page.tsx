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

export default async function Home() {
  const categories = await getCategories();

  return (
    <main className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center py-20 px-4 md:py-32 bg-gradient-to-b from-muted/50 to-background text-center">
        <div className="container flex flex-col items-center">
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight lg:text-7xl mb-6 max-w-4xl">
            Développez vos compétences <br className="hidden sm:inline" />
            <span className="text-primary">avec les meilleurs experts</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mb-10 leading-relaxed">
            Form-Act est la plateforme de référence pour connecter les entreprises
            avec des formateurs d'élite. Programmes sur-mesure, suivi qualité et simplicité administrative.
            </p>

            <div className="w-full max-w-md mb-12 transform hover:scale-105 transition-transform duration-300">
             <SearchHero categories={categories} />
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
            <Button asChild size="lg" className="h-12 px-8 text-lg">
                <Link href="/catalogue">Voir tout le catalogue</Link>
            </Button>
            <Button variant="outline" size="lg" asChild className="h-12 px-8 text-lg">
                <Link href="/register">Devenir Client</Link>
            </Button>
            </div>
        </div>
      </section>

      {/* Features Section (Reassurance) */}
      <section className="py-24 px-4 bg-muted/30 border-t">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard
            icon={GraduationCap}
            title="Expertise Garantie"
            description="Tous nos formateurs sont rigoureusement sélectionnés, vérifiés et évalués par notre communauté."
          />
          <FeatureCard
            icon={Calendar}
            title="Planification Flexible"
            description="Organisez vos sessions selon vos contraintes : présentiel, distanciel ou hybride, partout en Belgique."
          />
          <FeatureCard
            icon={BadgeCheck}
            title="Qualité Certifiée"
            description="Des programmes de formation conformes aux standards du marché et un suivi administratif automatisé."
          />
        </div>
      </section>
    </main>
  );
}

function FeatureCard({ icon: Icon, title, description }: { icon: any, title: string, description: string }) {
  return (
    <div className="flex flex-col items-center text-center p-8 bg-background rounded-xl shadow-sm border transition-all hover:shadow-md">
      <div className="h-14 w-14 bg-primary/10 rounded-full flex items-center justify-center mb-6 text-primary">
        <Icon className="h-7 w-7" />
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  )
}
