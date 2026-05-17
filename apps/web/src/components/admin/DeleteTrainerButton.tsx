'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Trash, Loader2 } from 'lucide-react';
import { API_URL } from '@/lib/config';
import { useRouter } from 'next/navigation';

export function DeleteTrainerButton({ id }: { id: string }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce formateur ?')) return;

    setIsDeleting(true);
    try {
        const res = await fetch(`${API_URL}/admin/trainers/${id}`, {
            method: 'DELETE',
        });
        if (res.ok) {
            router.refresh();
        } else {
            const data = await res.json();
            alert(data.message || 'Erreur lors de la suppression');
        }
    } catch (e) {
        alert('Erreur réseau');
    } finally {
        setIsDeleting(false);
    }
  };

  return (
    <Button
      size="icon"
      variant="ghost"
      className="text-destructive"
      onClick={handleDelete}
      disabled={isDeleting}
      aria-label="Supprimer le formateur"
    >
      {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash className="h-4 w-4" />}
    </Button>
  );
}
