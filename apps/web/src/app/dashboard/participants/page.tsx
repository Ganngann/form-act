"use client";

import { Users } from "lucide-react";

export default function ParticipantsPage() {
  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold tracking-tight">Participants.</h1>
        <p className="text-muted-foreground font-medium">
          Gérez la liste des apprenants inscrits à vos sessions.
        </p>
      </div>

      <div className="flex flex-col items-center justify-center py-32 bg-muted/10 rounded-[2rem] border border-border border-dashed">
        <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6">
          <Users className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Gestion bientôt disponible</h2>
        <p className="text-muted-foreground text-center max-w-sm">
          Cette fonctionnalité est en cours de développement. Vous pourrez
          bientôt gérer vos participants directement d&apos;ici.
        </p>
      </div>
    </div>
  );
}
