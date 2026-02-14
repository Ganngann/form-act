import { useEffect } from "react"
import { Tags, Plus, Pencil, Save, X } from "lucide-react"
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

  // ... (schema and components remain similar but with updated classes)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden" aria-describedby={undefined}>
        <DialogHeader className="p-8 bg-gray-50/50 border-b border-gray-100/50">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              {category ? <Pencil className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
            </div>
            <div>
              <DialogTitle className="text-xl font-black tracking-tight">
                {category ? "Modifier la catégorie" : "Nouvelle thématique"}
              </DialogTitle>
              <DialogDescription className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                Configuration du catalogue
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Nom de la catégorie *</Label>
            <div className="relative">
              <Tags className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="name"
                {...register("name")}
                className="pl-12 rounded-xl h-12 bg-gray-50/50 border-gray-100 focus:bg-white transition-all font-medium"
                placeholder="Ex: Soft Skills, Management..."
              />
            </div>
            {errors.name && (
              <p className="text-[10px] font-bold text-red-500 ml-1">{errors.name.message}</p>
            )}
          </div>

          <DialogFooter className="pt-4 flex gap-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="rounded-xl font-bold h-11 px-6">
              <X className="mr-2 h-4 w-4" /> Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting} className="rounded-xl font-bold h-11 px-8 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all">
              {isSubmitting ? "Traitement..." : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {category ? "Sauvegarder" : "Créer la catégorie"}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
