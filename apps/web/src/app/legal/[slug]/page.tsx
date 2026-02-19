export function generateStaticParams() {
  return [
    { slug: 'mentions-legales' },
    { slug: 'cgv' },
    { slug: 'confidentialite' },
  ];
}

export default function LegalPage({ params }: { params: { slug: string } }) {
  const titles: Record<string, string> = {
    "mentions-legales": "Mentions Légales",
    "cgv": "Conditions Générales de Vente",
    "confidentialite": "Politique de Confidentialité",
  };

  const title = titles[params.slug] || "Page Légale";

  return (
    <div className="container py-20 px-4 max-w-4xl">
      <h1 className="text-4xl font-black mb-8">{title}</h1>
      <div className="prose prose-lg max-w-none">
        <p className="text-muted-foreground font-medium">
          Ceci est une page générique pour les textes légaux.
          Le contenu spécifique sera ajouté ultérieurement.
        </p>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
        </p>
      </div>
    </div>
  );
}
