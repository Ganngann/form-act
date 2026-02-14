"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Pencil, Trash2, MoreHorizontal, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Card } from "@/components/ui/card"
import { Category } from "@/types/formation"
import { adminCategoriesService } from "@/services/admin-categories"

interface CategoriesTableProps {
  initialCategories: Category[]
}

export function CategoriesTable({ initialCategories }: CategoriesTableProps) {
  const router = useRouter()

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)

  const [isCreating, setIsCreating] = useState(false)
  const [newName, setNewName] = useState("")

  const handleCreateQuick = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim()) return

    setIsCreating(true)
    try {
      await adminCategoriesService.createCategory({ name: newName })
      setNewName("")
      router.refresh()
    } catch (error: any) {
      alert(error.message || "Erreur lors de la création")
    } finally {
      setIsCreating(false)
    }
  }

  const handleStartEdit = (category: Category) => {
    setEditingId(category.id)
    setEditingName(category.name)
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditingName("")
  }

  const handleSaveEdit = async (id: string) => {
    if (!editingName.trim()) return

    setIsUpdating(true)
    try {
      await adminCategoriesService.updateCategory(id, { name: editingName })
      setEditingId(null)
      router.refresh()
    } catch (error: any) {
      alert(error.message || "Erreur lors de la mise à jour")
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette catégorie ?")) {
      try {
        await adminCategoriesService.deleteCategory(id)
        router.refresh()
      } catch (error: any) {
        alert(error.message || "Erreur lors de la suppression")
      }
    }
  }

  const handleSuccess = () => {
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <Card className="border-none shadow-xl bg-white/50 backdrop-blur-sm rounded-[2rem] overflow-hidden">
        <form onSubmit={handleCreateQuick} className="p-6 flex flex-col md:flex-row items-center gap-4">
          <div className="flex-1 w-full">
            <h2 className="text-sm font-black text-gray-900 tracking-widest uppercase mb-4 flex items-center gap-2 px-1">
              <Plus className="h-4 w-4 text-primary" />
              Ajout Rapide
            </h2>
            <div className="relative group">
              <Input
                placeholder="Ex: Management, Développement Personnel, IT..."
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="h-14 rounded-2xl bg-white border-transparent shadow-sm focus-visible:ring-primary/20 font-medium text-lg pr-32 transition-all group-hover:shadow-md"
                disabled={isCreating}
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2">
                <Button
                  type="submit"
                  disabled={isCreating || !newName.trim()}
                  className="rounded-xl font-black text-[10px] uppercase tracking-widest h-10 px-6 shadow-lg shadow-primary/10 transition-all active:scale-95"
                >
                  {isCreating ? "..." : "Ajouter"}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </Card>

      <div className="rounded-[2.5rem] border-none shadow-xl bg-white overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50/50">
            <TableRow className="hover:bg-transparent border-gray-100">
              <TableHead className="pl-8 h-14 font-bold text-gray-600 uppercase text-xs tracking-wider">Nom de la thématique</TableHead>
              <TableHead className="pr-8 h-14 font-bold text-gray-600 uppercase text-xs tracking-wider text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {initialCategories.map((category) => {
              const isEditing = editingId === category.id

              return (
                <TableRow key={category.id} className="group hover:bg-blue-50/30 border-gray-100 transition-colors">
                  <TableCell className="pl-8 py-4">
                    {isEditing ? (
                      <Input
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="h-10 rounded-xl bg-white border-primary/20 shadow-sm font-medium"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSaveEdit(category.id)
                          if (e.key === "Escape") handleCancelEdit()
                        }}
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900 group-hover:text-primary transition-colors italic">
                          {category.name}
                        </span>
                        <span className="text-[10px] font-black text-muted-foreground/50 group-hover:text-primary/40 transition-colors">
                          ({category._count?.formations ?? 0})
                        </span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="pr-8 py-4 text-right">
                    {isEditing ? (
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleSaveEdit(category.id)}
                          disabled={isUpdating || !editingName.trim()}
                          className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={handleCancelEdit}
                          disabled={isUpdating}
                          className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-gray-100 rounded-lg text-muted-foreground">
                            <span className="sr-only">Ouvrir le menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-xl border-border shadow-xl">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleStartEdit(category)} className="cursor-pointer font-medium">
                            <Pencil className="mr-2 h-4 w-4" /> Modifier
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDelete(category.id)}
                            className="cursor-pointer text-red-600 focus:text-red-700 focus:bg-red-50 font-medium"
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
            {initialCategories.length === 0 && (
              <TableRow>
                <TableCell colSpan={2} className="h-32 text-center text-muted-foreground font-medium italic">
                  Aucune catégorie trouvée.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
