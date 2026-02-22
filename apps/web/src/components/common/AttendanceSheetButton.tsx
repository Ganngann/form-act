"use client";

import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { API_URL } from "@/lib/config";

interface AttendanceSheetButtonProps {
  sessionId: string;
  status: string;
  className?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  label?: string;
}

export function AttendanceSheetButton({
  sessionId,
  status,
  className,
  variant = "outline",
  size = "sm",
  label = "Télécharger Liste",
}: AttendanceSheetButtonProps) {
  const allowedStatuses = [
    "CONFIRMED",
    "PROOF_RECEIVED",
    "INVOICED",
    "ARCHIVED",
  ];

  if (!allowedStatuses.includes(status)) {
    return null;
  }

  const handleDownload = () => {
    // We use window.open to leverage browser cookies for authentication
    const url = `${API_URL}/sessions/${sessionId}/attendance-sheet`;
    window.open(url, "_blank");
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleDownload}
    >
      <FileText className="mr-2 h-4 w-4" />
      {label}
    </Button>
  );
}
