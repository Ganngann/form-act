'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { API_URL } from '@/lib/config';
import { useState } from 'react';

const formSchema = z.object({
  email: z.string().email('Email invalide'),
  firstName: z.string().min(1, 'Prénom requis'),
  lastName: z.string().min(1, 'Nom requis'),
});

type FormData = z.infer<typeof formSchema>;

interface TrainerFormProps {
  initialData?: FormData & { id?: string };
  isEdit?: boolean;
}

export function TrainerForm({ initialData, isEdit = false }: TrainerFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      email: '',
      firstName: '',
      lastName: '',
    },
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError(null);
    try {
      const url = isEdit
        ? `${API_URL}/admin/trainers/${initialData?.id}`
        : `${API_URL}/admin/trainers`;
      const method = isEdit ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.message || 'Erreur lors de l\'enregistrement');
      }

      router.push('/admin/trainers');
      router.refresh();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-lg">
      {error && <div className="text-red-500 text-sm">{error}</div>}

      <div className="space-y-2">
        <label htmlFor="firstName" className="text-sm font-medium">Prénom</label>
        <Input id="firstName" {...register('firstName')} />
        {errors.firstName && <p className="text-red-500 text-xs">{errors.firstName.message}</p>}
      </div>

      <div className="space-y-2">
        <label htmlFor="lastName" className="text-sm font-medium">Nom</label>
        <Input id="lastName" {...register('lastName')} />
        {errors.lastName && <p className="text-red-500 text-xs">{errors.lastName.message}</p>}
      </div>

      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium">Email</label>
        <Input id="email" type="email" {...register('email')} />
        {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="button" variant="outline" onClick={() => router.back()}>Annuler</Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Enregistrement...' : (isEdit ? 'Modifier' : 'Créer')}
        </Button>
      </div>
    </form>
  );
}
