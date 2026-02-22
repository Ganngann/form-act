import { PasswordChangeForm } from "@/components/auth/password-change-form";
import { Settings } from "lucide-react";
import { AdminHeader } from "@/components/admin/AdminHeader";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-12">
      <AdminHeader
        badge="Espace Administrateur"
        title="Paramètres"
        description="Gérez vos préférences et la sécurité de votre compte."
      >
        <div className="hidden md:block">
          <div className="h-16 w-16 bg-primary/5 rounded-2xl flex items-center justify-center text-primary">
            <Settings className="h-8 w-8" />
          </div>
        </div>
      </AdminHeader>

      <div className="max-w-2xl">
        <PasswordChangeForm />
      </div>
    </div>
  );
}
