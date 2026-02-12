import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  let colorClass = "bg-gray-100 text-gray-800 border-gray-200";
  let label = status;

  switch (status) {
    case 'CONFIRMED':
      colorClass = "bg-emerald-50 text-emerald-700 border-emerald-200";
      label = "Confirmée";
      break;
    case 'PENDING':
      colorClass = "bg-amber-50 text-amber-700 border-amber-200";
      label = "En attente";
      break;
    case 'COMPLETED':
      colorClass = "bg-blue-50 text-blue-700 border-blue-200";
      label = "Terminée";
      break;
    case 'CANCELLED':
      colorClass = "bg-red-50 text-red-700 border-red-200";
      label = "Annulée";
      break;
    case 'PROOF_RECEIVED':
      colorClass = "bg-indigo-50 text-indigo-700 border-indigo-200";
      label = "Preuve reçue";
      break;
  }

  return (
    <span className={cn("px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border", colorClass)}>
      {label}
    </span>
  );
}
