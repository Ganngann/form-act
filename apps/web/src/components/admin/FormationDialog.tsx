import { useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
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
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { adminFormationsService } from "@/services/admin-formations"
import { Formation, Category, Expertise } from "@/types/formation"

const schema = z.object({
  title: z.string().min(1, "Le titre est requis"),
  description: z.string().min(1, "La description est requise"),
  level: z.string().min(1, "Le niveau est requis"),
  duration: z.string().min(1, "La durée est requise"),
  durationType: z.enum(["HALF_DAY", "FULL_DAY"]),
  price: z.coerce.number().min(0, "Le prix doit être positif").optional(),
  categoryId: z.string().uuid("La catégorie est requise"),
  expertiseId: z.string().optional(),
  isPublished: z.boolean(),
  programLink: z.string().optional(),
  methodology: z.string().optional(),
  inclusions: z.string().optional(),
  imageUrl: z.string().optional(),
  agreementCode: z.string().optional(),
})

type FormData = z.infer<typeof schema>

interface FormationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  formation: Formation | null
  categories: Category[]
  expertises: Expertise[]
  onSuccess: () => void
}

export function FormationDialog({
  open,
  onOpenChange,
  formation,
  categories,
  expertises,
  onSuccess,
}: FormationDialogProps) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      description: "",
      level: "",
      duration: "",
      durationType: "HALF_DAY",
      isPublished: true,
      categoryId: undefined,
      expertiseId: "none",
    },
  })

  useEffect(() => {
    if (formation) {
      reset({
        title: formation.title,
        description: formation.description,
        level: formation.level,
        duration: formation.duration,
        durationType: formation.durationType,
        price: formation.price,
        categoryId: formation.categoryId,
        expertiseId: formation.expertiseId || "none",
        isPublished: formation.isPublished,
        programLink: formation.programLink || "",
        methodology: formation.methodology || "",
        inclusions: formation.inclusions || "",
        imageUrl: formation.imageUrl || "",
        agreementCode: formation.agreementCode || "",
      })
    } else {
      reset({
        title: "",
        description: "",
        level: "",
        duration: "",
        durationType: "HALF_DAY",
        isPublished: true,
        categoryId: undefined,
        expertiseId: "none",
        price: undefined,
        programLink: "",
        methodology: "",
        inclusions: "",
        imageUrl: "",
        agreementCode: "",
      })
    }
  }, [formation, reset, open])

  const onSubmit = async (data: FormData) => {
    try {
      const payload = {
        ...data,
        expertiseId: data.expertiseId === "none" ? undefined : data.expertiseId,
<<<<<<< HEAD
        price: data.price === undefined || isNaN(data.price) ? undefined : data.price,
=======
        price: data.price || undefined, // Handle 0 or undefined
>>>>>>> 5de36c41870330207a2d22f594d9c5ea644f4144
      }

      if (formation) {
        await adminFormationsService.updateFormation(formation.id, payload)
      } else {
        await adminFormationsService.createFormation(payload)
      }
      onSuccess()
      onOpenChange(false)
    } catch (error) {
      // Ideally show toast
      alert("Une erreur est survenue")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>
            {formation ? "Modifier la formation" : "Nouvelle formation"}
          </DialogTitle>
          <DialogDescription>
            Remplissez les informations ci-dessous pour {formation ? "modifier" : "créer"} une formation.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Titre *</Label>
              <Input id="title" {...register("title")} />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Catégorie *</Label>
              <Controller
                control={control}
                name="categoryId"
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner..." />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.categoryId && (
                <p className="text-sm text-red-500">{errors.categoryId.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="expertise">Expertise</Label>
              <Controller
                control={control}
                name="expertiseId"
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || "none"}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Aucune (Standard)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Aucune (Standard)</SelectItem>
                      {expertises.map((e) => (
                        <SelectItem key={e.id} value={e.id}>
                          {e.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="level">Niveau *</Label>
              <Input id="level" {...register("level")} />
               {errors.level && (
                <p className="text-sm text-red-500">{errors.level.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Durée (texte) *</Label>
              <Input id="duration" {...register("duration")} placeholder="Ex: 2 jours" />
               {errors.duration && (
                <p className="text-sm text-red-500">{errors.duration.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="durationType">Type de Durée *</Label>
              <Controller
                control={control}
                name="durationType"
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="HALF_DAY">Demi-journée (AM/PM)</SelectItem>
                      <SelectItem value="FULL_DAY">Journée complète (6h)</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

             <div className="space-y-2">
              <Label htmlFor="price">Prix (€ HTVA)</Label>
              <Input id="price" type="number" step="0.01" {...register("price")} />
            </div>

            <div className="space-y-2 flex flex-col justify-end">
               <div className="flex items-center space-x-2">
                  <Controller
                    control={control}
                    name="isPublished"
                    render={({ field }) => (
                      <Checkbox
                        id="isPublished"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                  <Label htmlFor="isPublished">Publié dans le catalogue</Label>
               </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea id="description" {...register("description")} />
             {errors.description && (
                <p className="text-sm text-red-500">{errors.description.message}</p>
              )}
          </div>

          <div className="space-y-2">
             <Label htmlFor="methodology">Méthodologie</Label>
             <Textarea id="methodology" {...register("methodology")} />
          </div>

          <div className="space-y-2">
             <Label htmlFor="inclusions">Inclusions</Label>
             <Textarea id="inclusions" {...register("inclusions")} placeholder="Ex: Syllabus, Certificat..." />
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
