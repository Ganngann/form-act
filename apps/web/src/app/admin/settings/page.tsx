import { PasswordChangeForm } from "@/components/auth/password-change-form";
import { Settings } from "lucide-react";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
        <div>
          <span className="inline-block px-3 py-1 rounded-md bg-primary/5 border border-primary/20 text-[10px] font-black uppercase tracking-widest text-primary mb-4">
            Espace Administrateur
          </span>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-gray-900 mb-2">
            Paramètres
          </h1>
          <p className="text-muted-foreground font-medium text-lg max-w-2xl">
            Gérez vos préférences et la sécurité de votre compte.
          </p>
        </div>
        <div className="hidden md:block">
          <div className="h-16 w-16 bg-primary/5 rounded-2xl flex items-center justify-center text-primary">
            <Settings className="h-8 w-8" />
          </div>
        </div>
      </div>

      <div className="max-w-2xl">
        <PasswordChangeForm />
      </div>
    </div>
  );
}
