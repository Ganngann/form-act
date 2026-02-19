"use client";

import { useState } from "react";
import { API_URL } from "@/lib/config";
import { Button, ButtonProps } from "@/components/ui/button";
import { FileDown, Loader2 } from "lucide-react";

interface DownloadAttendanceButtonProps extends ButtonProps {
  sessionId: string;
  sessionStatus: string;
}

export function DownloadAttendanceButton({
  sessionId,
  sessionStatus,
  className,
  children,
  ...props
}: DownloadAttendanceButtonProps) {
  const [loading, setLoading] = useState(false);

  // Check if session status allows download (CONFIRMED, PROOF_RECEIVED, INVOICED, etc.)
  // PENDING and CANCELLED are disallowed.
  const isDisabled = sessionStatus === 'PENDING' || sessionStatus === 'CANCELLED';

  const handleDownload = async () => {
    if (loading || isDisabled) return;
    setLoading(true);

    try {
      // Assuming cookie-based auth is handled by the browser automatically with credentials: 'include'
      // If we need to pass token manually, we'd need to access cookies via JS or use a fetch wrapper.
      // The current codebase context suggests cookies are used (httpOnly), so 'credentials: include' is key.

      const res = await fetch(`${API_URL}/sessions/${sessionId}/attendance-sheet`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!res.ok) {
        if (res.status === 400) {
            alert("L'émargement n'est disponible que pour les sessions confirmées.");
        } else if (res.status === 403) {
            alert("Vous n'avez pas les droits pour télécharger ce document.");
        } else {
            console.error("Download failed with status", res.status);
            alert("Une erreur est survenue lors du téléchargement. Veuillez réessayer.");
        }
        return;
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `emargement-${sessionId}.pdf`;
      document.body.appendChild(a);
      a.click();

      // Cleanup
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }, 100);

    } catch (e) {
      console.error("Network error during download", e);
      alert("Erreur réseau lors du téléchargement.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleDownload}
      disabled={loading || isDisabled}
      className={className}
      {...props}
    >
      {loading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <FileDown className="mr-2 h-4 w-4" />
      )}
      {children || "Liste Émargement (PDF)"}
    </Button>
  );
}
