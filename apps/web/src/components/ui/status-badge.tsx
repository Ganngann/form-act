import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  let colorClass = "bg-gray-100 text-gray-800";
  let label = status;

  switch (status) {
    case 'CONFIRMED':
      colorClass = "bg-green-100 text-green-800";
      label = "Confirmée";
      break;
    case 'PENDING':
      colorClass = "bg-yellow-100 text-yellow-800";
      label = "En attente";
      break;
    case 'COMPLETED':
      colorClass = "bg-blue-100 text-blue-800";
      label = "Terminée";
      break;
    case 'CANCELLED':
      colorClass = "bg-red-100 text-red-800";
      label = "Annulée";
      break;
    case 'PROOF_RECEIVED':
      colorClass = "bg-purple-100 text-purple-800";
      label = "Preuve reçue";
      break;
  }

  return (
    <span className={cn("px-2.5 py-0.5 rounded text-xs font-medium", colorClass)}>
      {label}
    </span>
  );
}
