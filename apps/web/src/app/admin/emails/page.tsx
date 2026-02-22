import { EmailTemplatesManager } from '@/components/admin/emails/EmailTemplatesManager';
import { AdminHeader } from '@/components/admin/AdminHeader';

export default function EmailsPage() {
  return (
    <div className="space-y-12">
      <AdminHeader
        badge="Communication"
        badgeClassName="bg-violet-50 border-violet-200 text-violet-600"
        title="Gabarits E-mail"
        description="Personnalisez les modèles d'e-mail envoyés aux clients et aux formateurs."
      />
      <EmailTemplatesManager />
    </div>
  );
}
