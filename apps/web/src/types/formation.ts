export type Category = {
  id: string;
  name: string;
  _count?: {
    formations: number;
  };
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
  agreementCodes?: string;
  imageUrl?: string;
  categoryId?: string;
  category?: Category;
  isPublished: boolean;
  isExpertise: boolean;
  authorizedTrainers?: Trainer[];
};

export type CreateFormationData = Omit<Formation, 'id' | 'category' | 'authorizedTrainers'> & {
  authorizedTrainerIds?: string[];
};
export type UpdateFormationData = Partial<CreateFormationData>;

export type CreateCategoryData = {
  name: string;
};

export type UpdateCategoryData = Partial<CreateCategoryData>;

export type Client = {
  id: string;
  companyName: string;
};

export type Participant = {
  firstName?: string;
  lastName?: string;
  name?: string;
  email?: string;
};

export type Session = {
  id: string;
  date: string | Date;
  location?: string;
  slot?: string;
  trainerId?: string;
  logistics?: string;
  participants?: string | null;
  proofUrl?: string;
  billedAt?: string | Date;
  formation: Formation;
  client?: Client;
  trainer?: Trainer;
  billingData?: string;
};

export type Formateur = Trainer;
