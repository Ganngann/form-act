export type EmailTemplate = {
  id: string;
  type: string;
  subject: string;
  body: string;
  variables: string | null; // JSON string
  updatedAt: string | Date;
};

export type UpdateEmailTemplateData = Partial<Pick<EmailTemplate, 'subject' | 'body'>>;
