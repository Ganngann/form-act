"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Category } from "@/types/formation"
import { CategoryDialog } from "@/components/admin/CategoryDialog"
import { adminCategoriesService } from "@/services/admin-categories"

interface CategoriesTableProps {
  initialCategories: Category[]
}

export function CategoriesTable({ initialCategories }: CategoriesTableProps) {
  const router = useRouter()
  // We rely on router.refresh() to update the list, but initialCategories comes from server.
  // Actually, router.refresh() re-runs the server component, so initialCategories will be updated.

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)

  const handleCreate = () => {
    setSelectedCategory(null)
    setIsDialogOpen(true)
  }

  const handleEdit = (category: Category) => {
    setSelectedCategory(category)
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette catégorie ?")) {
      try {
        await adminCategoriesService.deleteCategory(id)
        router.refresh()
      } catch (error: any) {
        // Backend returns BadRequest if linked to formations
        alert(error.message || "Erreur lors de la suppression")
      }
    }
  }

  const handleSuccess = () => {
    router.refresh()
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Liste des Catégories</h2>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Nouvelle Catégorie
        </Button>
      </div>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {initialCategories.map((category) => (
              <TableRow key={category.id}>
                <TableCell className="font-medium">{category.name}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(category)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleDelete(category.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {initialCategories.length === 0 && (
              <TableRow>
                <TableCell colSpan={2} className="text-center text-muted-foreground">
                  Aucune catégorie trouvée.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <CategoryDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        category={selectedCategory}
        onSuccess={handleSuccess}
      />
    </div>
  )
}
