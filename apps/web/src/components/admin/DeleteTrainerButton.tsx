"use client";

import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import { API_URL } from "@/lib/config";
import { useRouter } from "next/navigation";

export function DeleteTrainerButton({ id }: { id: string }) {
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce formateur ?")) return;

    try {
      const res = await fetch(`${API_URL}/admin/trainers/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.message || "Erreur lors de la suppression");
      }
    } catch (e) {
      alert("Erreur réseau");
    }
  };

  return (
    <Button
      size="icon"
      variant="ghost"
      className="text-destructive"
      onClick={handleDelete}
    >
      <Trash className="h-4 w-4" />
    </Button>
  );
}
