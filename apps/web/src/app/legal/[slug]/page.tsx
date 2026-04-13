import { getSiteConfig } from "@/lib/api-config";
import { LegalTextsConfig } from "@/types/configuration";
import { notFound } from "next/navigation";
import sanitizeHtml from "sanitize-html";

export const revalidate = 3600; // Revalidate every hour

export function generateStaticParams() {
  return [
    { slug: 'mentions-legales' },
    { slug: 'cgv' },
    { slug: 'confidentialite' },
  ];
}

export default async function LegalPage({ params }: { params: { slug: string } }) {
  const titles: Record<string, string> = {
    "mentions-legales": "Mentions Légales",
    "cgv": "Conditions Générales de Vente",
    "confidentialite": "Politique de Confidentialité",
  };

  const keys: Record<string, keyof LegalTextsConfig> = {
    "mentions-legales": "mentions",
    "cgv": "cgv",
    "confidentialite": "privacy",
  };

  const title = titles[params.slug];
  const key = keys[params.slug];

  if (!title || !key) {
    notFound();
  }

  const config = await getSiteConfig<LegalTextsConfig>("legal_texts");
  const content = config?.[key];

  return (
    <div className="container py-20 px-4 max-w-4xl">
      <h1 className="text-4xl font-black mb-8">{title}</h1>
      <div className="prose prose-lg max-w-none">
        {content ? (
          <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(content, { allowedTags: sanitizeHtml.defaults.allowedTags.concat(['span', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'img']), allowedAttributes: { '*': ['class', 'className'], 'img': ['src', 'alt', 'title', 'width', 'height'] } }) }} />
        ) : (
          <p className="text-muted-foreground font-medium">
            Contenu en cours de rédaction.
          </p>
        )}
      </div>
    </div>
  );
}
