export type Category = {
  id: string;
  name: string;
};

export type Trainer = {
  id: string;
  firstName: string;
  lastName: string;
};

export type Formation = {
  id: string;
  title: string;
  description: string;
  level: string;
  duration: string;
  durationType: "HALF_DAY" | "FULL_DAY";
  price?: number;
  programLink?: string;
  methodology?: string;
  inclusions?: string;
  agreementCodes?: string;
  imageUrl?: string;
  categoryId?: string;
  category?: Category;
  isPublished: boolean;
  isExpertise: boolean;
  authorizedTrainers?: Trainer[];
};

export type CreateFormationData = Omit<
  Formation,
  "id" | "category" | "authorizedTrainers"
> & {
  authorizedTrainerIds?: string[];
};
export type UpdateFormationData = Partial<CreateFormationData>;

export type CreateCategoryData = {
  name: string;
};

export type UpdateCategoryData = Partial<CreateCategoryData>;
