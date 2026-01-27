export type Category = {
  id: string;
  name: string;
};

export type Expertise = {
  id: string;
  name: string;
};

export type Formation = {
  id: string;
  title: string;
  description: string;
  level: string;
  duration: string;
  durationType: 'HALF_DAY' | 'FULL_DAY';
  price?: number;
  programLink?: string;
  methodology?: string;
  inclusions?: string;
  agreementCode?: string;
  imageUrl?: string;
  categoryId?: string;
  expertiseId?: string;
  category?: Category;
  expertise?: Expertise;
  isPublished: boolean;
};

export type CreateFormationData = Omit<Formation, 'id' | 'category' | 'expertise'>;
export type UpdateFormationData = Partial<CreateFormationData>;

export type CreateCategoryData = {
  name: string;
};

export type UpdateCategoryData = Partial<CreateCategoryData>;
