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
  durationType: 'HALF_DAY' | 'FULL_DAY';
  price?: number;
  programLink?: string;
  methodology?: string;
  inclusions?: string;
  agreementCode?: string;
  imageUrl?: string;
  categoryId?: string;
  category?: Category;
  isPublished: boolean;
  isExpertise: boolean;
  trainers?: Trainer[];
};

export type CreateFormationData = Omit<Formation, 'id' | 'category' | 'trainers'> & { trainerIds?: string[] };
export type UpdateFormationData = Partial<CreateFormationData>;
