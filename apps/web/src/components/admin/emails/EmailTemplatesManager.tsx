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
import { Loader2, Edit2 } from 'lucide-react';

export function EmailTemplatesManager() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminEmailsService.getEmailTemplates();
      setTemplates(data);
    } catch (error) {
      console.error('Failed to fetch templates:', error);
      setError("Impossible de charger les modèles. Vérifiez votre connexion ou contactez le support.");
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
    } catch (error) {
      console.error('Failed to save template:', error);
      alert('Erreur lors de la sauvegarde du template.');
    } finally {
      setSaving(false);
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

  if (loading && templates.length === 0) {
    return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="space-y-1">
            <CardTitle>Modèles d&apos;Emails Automatiques</CardTitle>
            <CardDescription>
              Gérez le contenu des emails envoyés automatiquement par la plateforme.
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={fetchTemplates} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Actualiser"}
          </Button>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-destructive/10 text-destructive p-4 rounded-md mb-4 text-sm font-medium">
              {error}
            </div>
          )}

          {!loading && !error && templates.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>Aucun modèle trouvé.</p>
              <p className="text-xs mt-1">Assurez-vous que la base de données a été initialisée (seed).</p>
            </div>
          )}

          {templates.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Sujet</TableHead>
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
          )}
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
