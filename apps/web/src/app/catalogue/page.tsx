import { Suspense } from "react";
import CatalogueContent from "./CatalogueContent";

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto py-10">
          Chargement du catalogue...
        </div>
      }
    >
      <CatalogueContent />
    </Suspense>
  );
}
