import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { adminFormationsService } from "@/services/admin-formations";
import { Formation, Category, Trainer } from "@/types/formation";
import {
  Plus,
  Trash2,
  FileText,
  Settings,
  Image as ImageIcon,
  BookOpen,
  Users,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

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
});

type FormData = z.infer<typeof schema>;

interface FormationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formation: Formation | null;
  categories: Category[];
  trainers: Trainer[];
  onSuccess: () => void;
}

type Agreement = {
  region: string;
  code: string;
};

export function FormationDialog({
  open,
  onOpenChange,
  formation,
  categories,
  trainers,
  onSuccess,
}: FormationDialogProps) {
  const [agreements, setAgreements] = useState<Agreement[]>([]);
  const [activeTab, setActiveTab] = useState("general");

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
  });

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
        authorizedTrainerIds:
          formation.authorizedTrainers?.map((t) => t.id) || [],
        isPublished: formation.isPublished,
        programLink: formation.programLink || "",
        methodology: formation.methodology || "",
        inclusions: formation.inclusions || "",
        imageUrl: formation.imageUrl || "",
        agreementCodes: formation.agreementCodes || "",
      });

      if (formation.agreementCodes) {
        try {
          const parsed = JSON.parse(formation.agreementCodes);
          if (Array.isArray(parsed)) {
            setAgreements(parsed);
          }
        } catch (e) {
          console.error("Failed to parse agreement codes", e);
          setAgreements([]);
        }
      } else {
        setAgreements([]);
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
      });
      setAgreements([]);
    }
  }, [formation, reset, open]);

  const addAgreement = () => {
    setAgreements([...agreements, { region: "", code: "" }]);
  };

  const updateAgreement = (
    index: number,
    field: keyof Agreement,
    value: string,
  ) => {
    const newAgreements = [...agreements];
    newAgreements[index][field] = value;
    setAgreements(newAgreements);
  };

  const removeAgreement = (index: number) => {
    setAgreements(agreements.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: FormData) => {
    try {
      const validAgreements = agreements.filter((a) => a.region && a.code);

      const payload = {
        ...data,
        authorizedTrainerIds: data.isExpertise ? data.authorizedTrainerIds : [],
        price:
          data.price === undefined || isNaN(data.price)
            ? undefined
            : data.price,
        agreementCodes:
          validAgreements.length > 0
            ? JSON.stringify(validAgreements)
            : undefined,
      };

      if (formation) {
        await adminFormationsService.updateFormation(formation.id, payload);
      } else {
        await adminFormationsService.createFormation(payload);
      }
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      alert("Une erreur est survenue");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] p-0 overflow-hidden bg-white/95 backdrop-blur-md rounded-[2.5rem] border-0 shadow-2xl flex flex-col">
        <div className="px-8 pt-8 pb-4 border-b border-border/50 shrink-0">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <BookOpen className="h-5 w-5" />
              </div>
              {formation ? "Modifier la formation" : "Nouvelle formation"}
            </DialogTitle>
            <DialogDescription className="text-base font-medium text-muted-foreground ml-14">
              {formation
                ? "Mettez à jour les détails du module."
                : "Configurez une nouvelle offre de formation."}
            </DialogDescription>
          </DialogHeader>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex-1 overflow-auto flex flex-col min-h-0"
        >
          <Tabs
            defaultValue="general"
            className="flex-1 flex flex-col"
            value={activeTab}
            onValueChange={setActiveTab}
          >
            <div className="px-8 pt-2 shrink-0">
              <TabsList className="bg-muted/50 p-1 rounded-xl w-full justify-start h-auto">
                <TabsTrigger
                  value="general"
                  className="rounded-lg px-4 py-2 text-sm font-bold data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all flex items-center gap-2"
                >
                  <FileText className="h-4 w-4" /> Général
                </TabsTrigger>
                <TabsTrigger
                  value="details"
                  className="rounded-lg px-4 py-2 text-sm font-bold data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all flex items-center gap-2"
                >
                  <Settings className="h-4 w-4" /> Détails &amp; Config
                </TabsTrigger>
                <TabsTrigger
                  value="media"
                  className="rounded-lg px-4 py-2 text-sm font-bold data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all flex items-center gap-2"
                >
                  <ImageIcon className="h-4 w-4" /> Médias &amp; Divers
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 overflow-auto p-8">
              <TabsContent
                value="general"
                className="space-y-6 m-0 h-full focus-visible:ring-0"
              >
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2 col-span-2">
                    <Label
                      htmlFor="title"
                      className="text-sm font-black uppercase text-gray-500 tracking-wide"
                    >
                      Titre de la formation
                    </Label>
                    <Input
                      id="title"
                      {...register("title")}
                      className="h-12 rounded-xl border-border bg-white font-bold text-lg focus-visible:ring-primary/20"
                      placeholder="Ex: Leadership Avancé..."
                    />
                    {errors.title && (
                      <p className="text-xs font-bold text-red-500">
                        {errors.title.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="category"
                      className="text-sm font-black uppercase text-gray-500 tracking-wide"
                    >
                      Catégorie
                    </Label>
                    <Controller
                      control={control}
                      name="categoryId"
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <SelectTrigger className="h-12 rounded-xl border-border bg-white font-medium">
                            <SelectValue placeholder="Sélectionner..." />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl border-border shadow-xl">
                            {categories.map((c) => (
                              <SelectItem
                                key={c.id}
                                value={c.id}
                                className="font-medium"
                              >
                                {c.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.categoryId && (
                      <p className="text-xs font-bold text-red-500">
                        {errors.categoryId.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="level"
                      className="text-sm font-black uppercase text-gray-500 tracking-wide"
                    >
                      Niveau
                    </Label>
                    <Input
                      id="level"
                      {...register("level")}
                      className="h-12 rounded-xl border-border bg-white font-medium"
                      placeholder="Ex: Débutant, Avancé..."
                    />
                    {errors.level && (
                      <p className="text-xs font-bold text-red-500">
                        {errors.level.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="description"
                    className="text-sm font-black uppercase text-gray-500 tracking-wide"
                  >
                    Description courte
                  </Label>
                  <Textarea
                    id="description"
                    {...register("description")}
                    className="min-h-[120px] rounded-xl border-border bg-white font-medium resize-none p-4"
                    placeholder="Décrivez les objectifs et le contenu..."
                  />
                  {errors.description && (
                    <p className="text-xs font-bold text-red-500">
                      {errors.description.message}
                    </p>
                  )}
                </div>

                <div className="bg-muted/30 p-4 rounded-2xl border border-border/50 flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-10 w-10 rounded-full flex items-center justify-center ${watch("isPublished") ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"}`}
                    >
                      <BookOpen className="h-5 w-5" />
                    </div>
                    <div>
                      <Label
                        htmlFor="isPublished"
                        className="font-bold text-gray-900 cursor-pointer"
                      >
                        Publication Catalogue
                      </Label>
                      <p className="text-xs text-muted-foreground font-medium">
                        Rendre cette formation visible aux clients
                      </p>
                    </div>
                  </div>
                  <Controller
                    control={control}
                    name="isPublished"
                    render={({ field }) => (
                      <Switch
                        id="isPublished"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                </div>
              </TabsContent>

              <TabsContent
                value="details"
                className="space-y-8 m-0 h-full focus-visible:ring-0"
              >
                {/* Durée & Prix */}
                <div className="grid md:grid-cols-2 gap-6 p-4 bg-muted/20 rounded-2xl border border-border/50">
                  <div className="space-y-2">
                    <Label
                      htmlFor="duration"
                      className="text-xs font-black uppercase text-primary tracking-wide"
                    >
                      Durée (Affichage)
                    </Label>
                    <Input
                      id="duration"
                      {...register("duration")}
                      className="h-10 rounded-lg border-border bg-white"
                      placeholder="Ex: 2 jours"
                    />
                    {errors.duration && (
                      <p className="text-xs font-bold text-red-500">
                        {errors.duration.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="durationType"
                      className="text-xs font-black uppercase text-primary tracking-wide"
                    >
                      Format
                    </Label>
                    <Controller
                      control={control}
                      name="durationType"
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <SelectTrigger className="h-10 rounded-lg border-border bg-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="HALF_DAY">
                              Demi-journée (AM/PM)
                            </SelectItem>
                            <SelectItem value="FULL_DAY">
                              Journée complète (6h)
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label
                      htmlFor="price"
                      className="text-xs font-black uppercase text-primary tracking-wide"
                    >
                      Prix de base (€ HTVA)
                    </Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      {...register("price")}
                      className="h-10 rounded-lg border-border bg-white font-mono"
                    />
                  </div>
                </div>

                {/* Expertise & Formateurs */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Controller
                      control={control}
                      name="isExpertise"
                      render={({ field }) => (
                        <Switch
                          id="isExpertise"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="data-[state=checked]:bg-amber-500"
                        />
                      )}
                    />
                    <div>
                      <Label
                        htmlFor="isExpertise"
                        className="font-bold text-gray-900"
                      >
                        Mode Expertise
                      </Label>
                      <p className="text-xs text-muted-foreground font-medium">
                        Restreindre cette formation à des formateurs spécifiques
                      </p>
                    </div>
                  </div>

                  {isExpertise && (
                    <div className="border-2 border-amber-100 bg-amber-50/30 rounded-2xl p-4 animate-in fade-in slide-in-from-top-2 duration-300">
                      <div className="flex items-center gap-2 mb-3 text-amber-700">
                        <Users className="h-4 w-4" />
                        <h4 className="font-bold text-sm">
                          Formateurs Habilités
                        </h4>
                      </div>
                      <ScrollArea className="h-48 rounded-xl bg-white border border-amber-100 p-2">
                        <div className="space-y-1">
                          {trainers.map((trainer) => (
                            <div
                              key={trainer.id}
                              className="flex items-center gap-3 p-2 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                              onClick={() => {
                                const current = authorizedTrainerIds || [];
                                const checked = current.includes(trainer.id);
                                if (checked) {
                                  setValue(
                                    "authorizedTrainerIds",
                                    current.filter((id) => id !== trainer.id),
                                  );
                                } else {
                                  setValue("authorizedTrainerIds", [
                                    ...current,
                                    trainer.id,
                                  ]);
                                }
                              }}
                            >
                              <Checkbox
                                id={`trainer-${trainer.id}`}
                                checked={authorizedTrainerIds?.includes(
                                  trainer.id,
                                )}
                                onCheckedChange={() => {}} // Handled by parent div for better UX
                                className="border-amber-300 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
                              />
                              <div className="flex-1">
                                <Label
                                  htmlFor={`trainer-${trainer.id}`}
                                  className="cursor-pointer font-medium text-gray-700"
                                >
                                  {trainer.firstName} {trainer.lastName}
                                </Label>
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  )}
                </div>

                {/* Methodo & Inclusions */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label
                      htmlFor="methodology"
                      className="text-sm font-bold text-gray-700"
                    >
                      Méthodologie
                    </Label>
                    <Textarea
                      id="methodology"
                      {...register("methodology")}
                      className="h-24 rounded-xl border-border bg-white text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="inclusions"
                      className="text-sm font-bold text-gray-700"
                    >
                      Inclusions
                    </Label>
                    <Textarea
                      id="inclusions"
                      {...register("inclusions")}
                      className="h-24 rounded-xl border-border bg-white text-sm"
                      placeholder="Ex: Syllabus, Certificat, Lunch..."
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent
                value="media"
                className="space-y-8 m-0 h-full focus-visible:ring-0"
              >
                <div className="space-y-4 bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
                  <h3 className="font-black text-blue-900 flex items-center gap-2">
                    <ImageIcon className="h-5 w-5" /> Liens Externes
                  </h3>
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="imageUrl"
                        className="text-xs font-bold uppercase text-blue-700"
                      >
                        URL Image (Couverture)
                      </Label>
                      <Input
                        id="imageUrl"
                        {...register("imageUrl")}
                        placeholder="https://..."
                        className="bg-white border-blue-200 focus-visible:ring-blue-400"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="programLink"
                        className="text-xs font-bold uppercase text-blue-700"
                      >
                        URL Programme (PDF Download)
                      </Label>
                      <Input
                        id="programLink"
                        {...register("programLink")}
                        placeholder="https://..."
                        className="bg-white border-blue-200 focus-visible:ring-blue-400"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-end border-b pb-2">
                    <div className="space-y-1">
                      <Label className="font-black text-gray-900">
                        Agréments &amp; Subsides
                      </Label>
                      <p className="text-xs text-muted-foreground font-medium">
                        Codes pour KMO, Chèques-Formation...
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={addAgreement}
                      className="rounded-full font-bold text-xs h-8"
                    >
                      <Plus className="h-3 w-3 mr-1" /> Ajouter
                    </Button>
                  </div>

                  {agreements.length === 0 && (
                    <div className="text-center p-8 border-2 border-dashed border-gray-200 rounded-2xl text-muted-foreground text-sm font-medium bg-gray-50/50">
                      Aucun agrément configuré.
                    </div>
                  )}

                  <div className="space-y-3">
                    {agreements.map((agreement, index) => (
                      <div
                        key={index}
                        className="flex gap-3 items-center bg-white p-2 pr-4 rounded-xl border shadow-sm group"
                      >
                        <div className="h-8 w-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500 font-black text-xs shrink-0">
                          {index + 1}
                        </div>
                        <Input
                          placeholder="Région / Type (ex: Wallonie)"
                          value={agreement.region}
                          onChange={(e) =>
                            updateAgreement(index, "region", e.target.value)
                          }
                          className="h-9 border-transparent bg-transparent hover:bg-gray-50 focus:bg-gray-50 transition-colors font-medium rounded-lg"
                        />
                        <div className="w-px h-6 bg-gray-200 mx-2"></div>
                        <Input
                          placeholder="Code (ex: 123-456)"
                          value={agreement.code}
                          onChange={(e) =>
                            updateAgreement(index, "code", e.target.value)
                          }
                          className="h-9 border-transparent bg-transparent hover:bg-gray-50 focus:bg-gray-50 transition-colors font-mono text-sm rounded-lg"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeAgreement(index)}
                          className="h-8 w-8 hover:bg-red-50 hover:text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </div>

            <DialogFooter className="px-8 py-6 border-t border-border/50 bg-gray-50/50 shrink-0">
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                className="rounded-xl font-bold text-muted-foreground hover:text-gray-900"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="rounded-xl font-bold px-8 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all"
              >
                {isSubmitting
                  ? "Enregistrement..."
                  : "Enregistrer la formation"}
              </Button>
            </DialogFooter>
          </Tabs>
        </form>
      </DialogContent>
    </Dialog>
  );
}
