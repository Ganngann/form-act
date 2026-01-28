import { useEffect, useState } from "react"
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
import { Formation, Category, Trainer } from "@/types/formation"
import { Plus, Trash2 } from "lucide-react"

const schema = z.object({
  title: z.string().min(1, "Le titre est requis"),
  description: z.string().min(1, "La description est requise"),
  level: z.string().min(1, "Le niveau est requis"),
  duration: z.string().min(1, "La durée est requise"),
  durationType: z.enum(["HALF_DAY", "FULL_DAY"]),
  price: z.coerce.number().min(0, "Le prix doit être positif").optional(),
  categoryId: z.string().uuid("La catégorie est requise"),
  isExpertise: z.boolean(),
  authorizedTrainerIds: z.array(z.string()).optional(),
  isPublished: z.boolean(),
  programLink: z.string().optional(),
  methodology: z.string().optional(),
  inclusions: z.string().optional(),
  imageUrl: z.string().optional(),
  agreementCodes: z.string().optional(),
})

type FormData = z.infer<typeof schema>

interface FormationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  formation: Formation | null
  categories: Category[]
  trainers: Trainer[]
  onSuccess: () => void
}

type Agreement = {
  region: string
  code: string
}

export function FormationDialog({
  open,
  onOpenChange,
  formation,
  categories,
  trainers,
  onSuccess,
}: FormationDialogProps) {
  const [agreements, setAgreements] = useState<Agreement[]>([])

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      title: "",
      description: "",
      level: "",
      duration: "",
      durationType: "HALF_DAY",
      isPublished: true,
      categoryId: undefined,
      isExpertise: false,
      authorizedTrainerIds: [],
    },
  })

  const isExpertise = watch("isExpertise");
  const authorizedTrainerIds = watch("authorizedTrainerIds");

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
        isExpertise: formation.isExpertise,
        authorizedTrainerIds: formation.authorizedTrainers?.map(t => t.id) || [],
        isPublished: formation.isPublished,
        programLink: formation.programLink || "",
        methodology: formation.methodology || "",
        inclusions: formation.inclusions || "",
        imageUrl: formation.imageUrl || "",
        agreementCodes: formation.agreementCodes || "",
      })

      if (formation.agreementCodes) {
        try {
          const parsed = JSON.parse(formation.agreementCodes)
          if (Array.isArray(parsed)) {
            setAgreements(parsed)
          }
        } catch (e) {
          console.error("Failed to parse agreement codes", e)
          setAgreements([])
        }
      } else {
        setAgreements([])
      }
    } else {
      reset({
        title: "",
        description: "",
        level: "",
        duration: "",
        durationType: "HALF_DAY",
        isPublished: true,
        categoryId: undefined,
        isExpertise: false,
        authorizedTrainerIds: [],
        price: undefined,
        programLink: "",
        methodology: "",
        inclusions: "",
        imageUrl: "",
        agreementCodes: "",
      })
      setAgreements([])
    }
  }, [formation, reset, open])

  const addAgreement = () => {
    setAgreements([...agreements, { region: "", code: "" }])
  }

  const updateAgreement = (index: number, field: keyof Agreement, value: string) => {
    const newAgreements = [...agreements]
    newAgreements[index][field] = value
    setAgreements(newAgreements)
  }

  const removeAgreement = (index: number) => {
    setAgreements(agreements.filter((_, i) => i !== index))
  }

  const onSubmit = async (data: FormData) => {
    try {
      const validAgreements = agreements.filter(a => a.region && a.code)

      const payload = {
        ...data,
        authorizedTrainerIds: data.isExpertise ? data.authorizedTrainerIds : [],
        price: data.price === undefined || isNaN(data.price) ? undefined : data.price,
        agreementCodes: validAgreements.length > 0 ? JSON.stringify(validAgreements) : undefined
      }

      if (formation) {
        await adminFormationsService.updateFormation(formation.id, payload)
      } else {
        await adminFormationsService.createFormation(payload)
      }
      onSuccess()
      onOpenChange(false)
    } catch (error) {
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
            <div className="flex items-center space-x-2">
              <Controller
                control={control}
                name="isExpertise"
                render={({ field }) => (
                  <Checkbox
                    id="isExpertise"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <Label htmlFor="isExpertise">Est une expertise ? (Restreint aux formateurs habilités)</Label>
            </div>
          </div>

          {isExpertise && (
            <div className="space-y-2 border p-4 rounded-md bg-gray-50">
              <Label>Formateurs habilités</Label>
              <div className="h-40 overflow-y-auto space-y-2">
                {trainers.map((trainer) => (
                  <div key={trainer.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`trainer-${trainer.id}`}
                      checked={authorizedTrainerIds?.includes(trainer.id)}
                      onCheckedChange={(checked) => {
                        const current = authorizedTrainerIds || [];
                        if (checked) {
                          setValue("authorizedTrainerIds", [...current, trainer.id]);
                        } else {
                          setValue(
                            "authorizedTrainerIds",
                            current.filter((id) => id !== trainer.id)
                          );
                        }
                      }}
                    />
                    <Label htmlFor={`trainer-${trainer.id}`}>
                      {trainer.firstName} {trainer.lastName}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea id="description" {...register("description")} />
             {errors.description && (
                <p className="text-sm text-red-500">{errors.description.message}</p>
              )}
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
               <Label htmlFor="imageUrl">URL Image</Label>
               <Input id="imageUrl" {...register("imageUrl")} placeholder="https://..." />
             </div>
             <div className="space-y-2">
               <Label htmlFor="programLink">URL Programme (PDF)</Label>
               <Input id="programLink" {...register("programLink")} placeholder="https://..." />
             </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
               <Label>Agréments / Codes Subsides</Label>
               <Button type="button" variant="outline" size="sm" onClick={addAgreement}>
                 <Plus className="h-4 w-4 mr-1" /> Ajouter
               </Button>
            </div>
            {agreements.length === 0 && (
               <p className="text-sm text-muted-foreground italic">Aucun agrément configuré.</p>
            )}
            <div className="space-y-2">
              {agreements.map((agreement, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <Input
                    placeholder="Région / Type (ex: Wallonie)"
                    value={agreement.region}
                    onChange={(e) => updateAgreement(index, 'region', e.target.value)}
                  />
                  <Input
                    placeholder="Code (ex: 123-456)"
                    value={agreement.code}
                    onChange={(e) => updateAgreement(index, 'code', e.target.value)}
                  />
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeAgreement(index)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>
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
