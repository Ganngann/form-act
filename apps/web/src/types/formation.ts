export type Category = {
  id: string;
  name: string;
};

export type Trainer = {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
};

// Alias Trainer to Formateur for backward compatibility if needed
export type Formateur = Trainer;

export type User = {
  id: string;
  email: string;
  name?: string;
  role: 'ADMIN' | 'TRAINER' | 'CLIENT';
};

export type Client = {
  id: string;
  companyName: string;
  contactName: string;
  userId: string;
  user?: User;
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

export type Session = {
  id: string;
  formationId: string;
  formation: Formation;
  clientId: string;
  client?: Client;
  trainerId?: string;
  trainer?: Trainer;
  date: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'PROOF_RECEIVED' | 'INVOICED';
  location?: string;
  participants?: string; // JSON string
  logistics?: string; // JSON string
  isLogisticsOpen: boolean;
  proofUrl?: string;
  billedAt?: string;
  billingData?: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateFormationData = Omit<Formation, 'id' | 'category' | 'authorizedTrainers'> & {
  authorizedTrainerIds?: string[];
};
export type UpdateFormationData = Partial<CreateFormationData>;

export type CreateCategoryData = {
  name: string;
};

export type UpdateCategoryData = Partial<CreateCategoryData>;
