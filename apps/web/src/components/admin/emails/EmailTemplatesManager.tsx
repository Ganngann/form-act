'use client';

import { useState, useEffect } from 'react';
import { adminEmailsService } from '@/services/admin-emails';
import { EmailTemplate } from '@/types/email-template';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Loader2, Edit2, Send } from 'lucide-react';

const TEMPLATE_DESCRIPTIONS: Record<string, string> = {
  CHECKOUT_CONFIRMATION: "Envoyé au client immédiatement après qu'il ait soumis une demande de formation. Confirme la bonne réception de la demande par l'équipe.",
  PASSWORD_RESET: "Envoyé à tout utilisateur (client, formateur, admin) qui demande une réinitialisation de son mot de passe. Contient un lien de réinitialisation sécurisé, valable 1 heure.",
  SESSION_OFFER: "Envoyé au client lorsqu'un administrateur a analysé sa demande et lui fait une proposition tarifaire formelle pour la formation.",
  SESSION_CONFIRMATION: "Envoyé au client lorsqu'il valide l'offre proposée. Confirme que la session de formation est définitivement planifiée.",
  SESSION_INVOICED: "Envoyé au client après que la session de formation ait eu lieu et que la facturation ait été générée par l'administration.",
  SESSION_CANCELLED_CLIENT: "Envoyé au client pour l'informer que sa session de formation a été annulée.",
  SESSION_CANCELLED_TRAINER: "Envoyé au formateur pour l'informer que sa mission pour une session donnée a été annulée.",
  LOGISTICS_REMINDER_48H: "Envoyé au client 48 heures avant la session de formation s'il manque des informations logistiques indispensables.",
  PARTICIPANTS_ALERT_J15: "Envoyé au client 15 jours avant le début de la formation pour lui rappeler de fournir la liste des participants.",
  PARTICIPANTS_CRITICAL_J9: "Envoyé au client 9 jours avant le début de la formation, de manière urgente, si la liste des participants est toujours manquante. Prévient d'un risque d'annulation.",
  PROGRAM_SEND_J30: "Envoyé au client 30 jours avant le début de la formation pour lui fournir le programme détaillé de celle-ci.",
  MISSION_REMINDER_J21: "Envoyé au formateur 21 jours avant sa mission pour lui rappeler les détails de la session (client, lieu, date).",
  DOC_PACK_J7: "Envoyé au formateur 7 jours avant le début de la formation. Contient le pack documentaire, incluant notamment la feuille d'émargement.",
  PROOF_REMINDER_J1: "Envoyé au formateur le lendemain de la formation pour lui rappeler de déposer la feuille d'émargement signée afin de déclencher la facturation."
};

export function EmailTemplatesManager() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testEmail, setTestEmail] = useState('');

  // Form state
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const data = await adminEmailsService.getEmailTemplates();
      setTemplates(data);
    } catch (error) {
      console.error('Failed to fetch templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setSubject(template.subject);
    setBody(template.body);
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!selectedTemplate) return;

    setSaving(true);
    try {
      await adminEmailsService.updateTemplate(selectedTemplate.type, {
        subject,
        body,
      });
      await fetchTemplates(); // Refresh list
      setIsDialogOpen(false);
      alert('Template sauvegardé avec succès.');
    } catch (error) {
      console.error('Failed to save template:', error);
      alert('Erreur lors de la sauvegarde du template.');
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    if (!selectedTemplate) return;
    if (!testEmail || !testEmail.includes('@')) {
      alert('Veuillez entrer une adresse email valide pour le test.');
      return;
    }

    setTesting(true);
    try {
      await adminEmailsService.sendTestEmail(selectedTemplate.type, {
        email: testEmail,
        subject,
        body,
      });
      alert('L\'email de test a été envoyé avec succès !');
    } catch (error) {
      console.error('Failed to send test email:', error);
      alert('Erreur lors de l\'envoi de l\'email de test.');
    } finally {
      setTesting(false);
    }
  };

  const parseVariables = (json: string | null): string[] => {
    if (!json) return [];
    try {
      return JSON.parse(json);
    } catch {
      return [];
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Modèles d&apos;Emails Automatiques</CardTitle>
          <CardDescription>
            Gérez le contenu des emails envoyés automatiquement par la plateforme.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Sujet</TableHead>
                <TableHead>Description & Déclencheurs</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templates.map((template) => (
                <TableRow key={template.id}>
                  <TableCell className="font-medium">
                    {template.type}
                  </TableCell>
                  <TableCell className="truncate max-w-md">
                    {template.subject}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground whitespace-pre-wrap max-w-sm">
                    {TEMPLATE_DESCRIPTIONS[template.type] || 'Description non disponible.'}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(template)}>
                      <Edit2 className="w-4 h-4 mr-2" />
                      Modifier
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier le modèle : {selectedTemplate?.type}</DialogTitle>
            <DialogDescription>
              Vous pouvez utiliser les variables listées ci-dessous dans le sujet et le corps du message.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="bg-muted p-3 rounded-md text-sm">
              <span className="font-semibold block mb-1">Variables disponibles :</span>
              <div className="flex flex-wrap gap-2">
                {parseVariables(selectedTemplate?.variables ?? null).map((v) => (
                  <code key={v} className="bg-background px-1 py-0.5 rounded border text-xs">
                    {"{{" + v + "}}"}
                  </code>
                ))}
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="subject">Sujet</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="body">Contenu (HTML supporté)</Label>
              <Textarea
                id="body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="min-h-[300px] font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Note : Le contenu est interprété comme du HTML. Soyez prudent avec les balises.
              </p>
            </div>

            <div className="mt-4 pt-4 border-t">
              <h4 className="text-sm font-medium mb-2">Envoyer un test</h4>
              <div className="flex gap-2">
                <Input
                  placeholder="Adresse email pour le test"
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                />
                <Button
                  variant="secondary"
                  onClick={handleTest}
                  disabled={testing || !testEmail}
                >
                  {testing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                  Tester
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={saving}>
              Annuler
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
