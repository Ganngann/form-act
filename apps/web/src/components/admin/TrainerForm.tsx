'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { API_URL } from '@/lib/config';
import { useState, useEffect } from 'react';

const formSchema = z.object({
  email: z.string().email('Email invalide'),
  firstName: z.string().min(1, 'Prénom requis'),
  lastName: z.string().min(1, 'Nom requis'),
  predilectionZones: z.array(z.string()).optional(),
  expertiseZones: z.array(z.string()).optional(),
});

type FormData = z.infer<typeof formSchema>;

interface Zone {
  id: string;
  name: string;
  code: string;
}

interface TrainerFormProps {
  initialData?: any;
  isEdit?: boolean;
}

export function TrainerForm({ initialData, isEdit = false }: TrainerFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [zones, setZones] = useState<Zone[]>([]);

  // Process initialData to match form schema
  const defaultValues: FormData = {
    email: initialData?.email || '',
    firstName: initialData?.firstName || '',
    lastName: initialData?.lastName || '',
    predilectionZones: initialData?.predilectionZones?.map((z: any) => z.id) || [],
    expertiseZones: initialData?.expertiseZones?.map((z: any) => z.id) || [],
  };

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const predilectionIds = watch('predilectionZones') || [];
  const expertiseIds = watch('expertiseZones') || [];

  useEffect(() => {
    fetch(`${API_URL}/zones`)
      .then((res) => res.json())
      .then((data) => setZones(data))
      .catch((err) => console.error('Failed to fetch zones', err));
  }, []);

  const handlePredilectionChange = (zoneId: string, checked: boolean) => {
    const current = new Set(predilectionIds);
    if (checked) {
      current.add(zoneId);
      // Also check expertise
      const currentExpertise = new Set(expertiseIds);
      currentExpertise.add(zoneId);
      setValue('expertiseZones', Array.from(currentExpertise));
    } else {
      current.delete(zoneId);
    }
    setValue('predilectionZones', Array.from(current));
  };

  const handleExpertiseChange = (zoneId: string, checked: boolean) => {
    const current = new Set(expertiseIds);
    if (checked) {
      current.add(zoneId);
    } else {
      current.delete(zoneId);
    }
    setValue('expertiseZones', Array.from(current));
  };

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

      {zones.length > 0 && (
        <div className="space-y-4 pt-4 border-t">
          <h3 className="text-lg font-medium">Zones d&apos;intervention</h3>
          <div className="grid grid-cols-3 gap-4 font-medium text-sm text-gray-500 mb-2">
            <div>Province</div>
            <div className="text-center">Prédilection</div>
            <div className="text-center">Expertise</div>
          </div>
          <div className="space-y-2">
            {zones.map((zone) => {
              const isPredilection = predilectionIds.includes(zone.id);
              const isExpertise = expertiseIds.includes(zone.id);

              return (
                <div key={zone.id} className="grid grid-cols-3 gap-4 items-center">
                  <div className="text-sm">{zone.name}</div>
                  <div className="flex justify-center">
                    <input
                      type="checkbox"
                      checked={isPredilection}
                      onChange={(e) => handlePredilectionChange(zone.id, e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                  </div>
                  <div className="flex justify-center">
                    <input
                      type="checkbox"
                      checked={isExpertise || isPredilection}
                      disabled={isPredilection}
                      onChange={(e) => handleExpertiseChange(zone.id, e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary disabled:opacity-50"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex gap-2 pt-4">
        <Button type="button" variant="outline" onClick={() => router.back()}>Annuler</Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Enregistrement...' : (isEdit ? 'Modifier' : 'Créer')}
        </Button>
      </div>
    </form>
  );
}
