"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Pencil, Trash2, CheckCircle2, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table" // Assuming these exist, if not I'll check.
import { Formation, Category, Trainer } from "@/types/formation"
import { FormationDialog } from "@/components/admin/FormationDialog"
import { adminFormationsService } from "@/services/admin-formations"
import { Badge } from "@/components/ui/badge" // Assuming badge exists

interface FormationsTableProps {
  initialFormations: Formation[]
  categories: Category[]
  trainers: Trainer[]
}

export function FormationsTable({
  initialFormations,
  categories,
  trainers,
}: FormationsTableProps) {
  const router = useRouter()
  const [formations] = useState(initialFormations) // We rely on router.refresh usually, but props update automatically?
  // Actually, if we use router.refresh(), server comp re-renders, passing new initialFormations.

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedFormation, setSelectedFormation] = useState<Formation | null>(null)

  const handleCreate = () => {
    setSelectedFormation(null)
    setIsDialogOpen(true)
  }

  const handleEdit = (formation: Formation) => {
    setSelectedFormation(formation)
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette formation ?")) {
      try {
        await adminFormationsService.deleteFormation(id)
        router.refresh()
      } catch (error) {
        alert("Erreur lors de la suppression (impossible si sessions liées)")
      }
    }
  }

  const handleSuccess = () => {
    router.refresh()
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Liste des Formations</h2>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Nouvelle Formation
        </Button>
      </div>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Titre</TableHead>
              <TableHead>Catégorie</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Prix</TableHead>
              <TableHead>État</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {initialFormations.map((formation) => (
              <TableRow key={formation.id}>
                <TableCell className="font-medium">{formation.title}</TableCell>
                <TableCell>{formation.category?.name || "-"}</TableCell>
                <TableCell>
                  {formation.isExpertise ? (
                    <span className="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary text-primary-foreground hover:bg-primary/80">Expertise</span>
                  ) : (
                    <span className="text-muted-foreground text-sm">Standard</span>
                  )}
                </TableCell>
                <TableCell>{formation.price ? `${formation.price} €` : "-"}</TableCell>
                <TableCell>
                  {formation.isPublished ? (
                    <span className="flex items-center text-green-600 text-sm">
                      <CheckCircle2 className="mr-1 h-4 w-4" /> Publié
                    </span>
                  ) : (
                    <span className="flex items-center text-gray-400 text-sm">
                      <XCircle className="mr-1 h-4 w-4" /> Masqué
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(formation)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleDelete(formation.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <FormationDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        formation={selectedFormation}
        categories={categories}
        trainers={trainers}
        onSuccess={handleSuccess}
      />
    </div>
  )
}
