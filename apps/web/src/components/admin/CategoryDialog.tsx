import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { adminCategoriesService } from "@/services/admin-categories"
import { Category } from "@/types/formation"

const schema = z.object({
  name: z.string().min(1, "Le nom est requis"),
})

type FormData = z.infer<typeof schema>

interface CategoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  category: Category | null
  onSuccess: () => void
}

export function CategoryDialog({
  open,
  onOpenChange,
  category,
  onSuccess,
}: CategoryDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
    },
  })

  useEffect(() => {
    if (category) {
      reset({
        name: category.name,
      })
    } else {
      reset({
        name: "",
      })
    }
  }, [category, reset, open])

  const onSubmit = async (data: FormData) => {
    try {
      if (category) {
        await adminCategoriesService.updateCategory(category.id, data)
      } else {
        await adminCategoriesService.createCategory(data)
      }
      onSuccess()
      onOpenChange(false)
    } catch (error) {
      alert("Une erreur est survenue")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>
            {category ? "Modifier la catégorie" : "Nouvelle catégorie"}
          </DialogTitle>
          <DialogDescription>
            Remplissez les informations ci-dessous pour {category ? "modifier" : "créer"} une catégorie.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom *</Label>
            <Input id="name" {...register("name")} />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
