import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { SessionData, getComputedStatus, STATUS_LABELS, STATUS_COLORS } from "@/lib/session-status"

interface SessionDetailsDialogProps {
  session: SessionData | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SessionDetailsDialog({ session, open, onOpenChange }: SessionDetailsDialogProps) {
  if (!session) return null

  const computedStatus = getComputedStatus(session)
  const clientName = session.client?.companyName || "Client inconnu"
  const trainerName = session.trainer ? `${session.trainer.firstName} ${session.trainer.lastName}` : "Non assigné"
  const formationTitle = session.formation?.title || "Formation"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{formationTitle}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Date</span>
            <span>{format(new Date(session.date), "dd MMMM yyyy", { locale: fr })}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Créneau</span>
            <span>{session.slot === 'AM' ? 'Matin' : 'Après-midi'}</span>
          </div>

          <div className="border-t my-2" />

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Statut</span>
            <span className={`px-2 py-1 rounded text-xs font-semibold border ${STATUS_COLORS[computedStatus]}`}>
              {STATUS_LABELS[computedStatus]}
            </span>
          </div>

          <div className="grid gap-1">
            <span className="text-sm font-medium text-muted-foreground">Client</span>
            <span className="font-medium">{clientName}</span>
          </div>

          <div className="grid gap-1">
            <span className="text-sm font-medium text-muted-foreground">Formateur</span>
            <span>{trainerName}</span>
          </div>

          <div className="grid gap-1">
            <span className="text-sm font-medium text-muted-foreground">Lieu</span>
            <span>{session.location || "À définir (En attente logistique)"}</span>
          </div>

          <div className="grid gap-1">
            <span className="text-sm font-medium text-muted-foreground">Participants</span>
            <span>{session.participants ? JSON.parse(session.participants).length + " inscrits" : "Liste vide"}</span>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Fermer</Button>
          <Button asChild>
            <Link href={`/admin/sessions/${session.id}`}>Gérer la session</Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
