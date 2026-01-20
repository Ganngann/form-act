import { differenceInDays, isBefore, isPast, differenceInHours } from "date-fns";

export type SessionStatus =
  | "PENDING"
  | "CONFIRMED"
  | "CANCELLED"
  | "LOGISTICS_MISSING" // > 48h after booking, logistics empty
  | "PARTICIPANTS_MISSING" // J-15, participants empty
  | "READY" // Logistics & Participants OK
  | "PROOF_MISSING" // Date passed, proof missing
  | "TO_BILL" // Proof uploaded, not billed
  | "BILLED"; // Billed

export interface SessionData {
  id: string;
  date: string | Date; // ISO string or Date object
  slot: string; // AM / PM
  trainerId: string;
  status: string; // Database status (PENDING, CONFIRMED, CANCELLED)
  location?: string | null;
  logistics?: string | null;
  participants?: string | null;
  proofUrl?: string | null;
  billedAt?: string | Date | null;
  createdAt?: string | Date; // Needed for T+48h rule

  // Relations (included via API)
  client?: {
    companyName: string;
    vatNumber?: string;
  } | null;
  trainer?: {
    firstName: string;
    lastName: string;
  } | null;
  formation?: {
    title: string;
  } | null;
}

export function getComputedStatus(session: SessionData): SessionStatus {
  const now = new Date();
  const sessionDate = new Date(session.date);
  const dbStatus = session.status as "PENDING" | "CONFIRMED" | "CANCELLED";

  if (dbStatus === "CANCELLED") return "CANCELLED";
  if (dbStatus === "PENDING") return "PENDING";

  // From here, session is CONFIRMED (or other positive status)

  // 1. PAST SESSIONS (Billing Workflow)
  if (isBefore(sessionDate, now)) {
    if (session.billedAt) return "BILLED";
    if (session.proofUrl) return "TO_BILL";
    return "PROOF_MISSING";
  }

  // 2. FUTURE SESSIONS (Logistics Workflow)
  const hasLogistics = !!session.location && !!session.logistics; // Assuming location is part of logistics check
  const hasParticipants = !!session.participants && session.participants !== "[]";

  if (hasLogistics && hasParticipants) {
    return "READY";
  }

  // Check critical deadlines
  const daysUntilSession = differenceInDays(sessionDate, now);

  // J-15: Participants Missing
  if (daysUntilSession <= 15 && !hasParticipants) {
    return "PARTICIPANTS_MISSING";
  }

  // T+48h: Logistics Missing
  // Check if session was created more than 48 hours ago
  if (!hasLogistics) {
      if (session.createdAt) {
          const hoursSinceCreation = differenceInHours(now, new Date(session.createdAt));
          if (hoursSinceCreation > 48) {
              return "LOGISTICS_MISSING";
          }
           // Grace period active
          return "CONFIRMED";
      }
      // Fallback if createdAt is missing (assume old data)
      return "LOGISTICS_MISSING";
  }

  // If logistics present but participants missing (and > J-15)
  if (hasLogistics && !hasParticipants) {
      // It's technically "Logistics OK, waiting for participants"
      return "CONFIRMED";
  }

  return "CONFIRMED";
}

export const STATUS_COLORS: Record<SessionStatus, string> = {
  PENDING: "bg-orange-100 text-orange-800 border-orange-200",
  CONFIRMED: "bg-blue-100 text-blue-800 border-blue-200",
  CANCELLED: "bg-red-100 text-red-800 border-red-200 line-through opacity-50",
  LOGISTICS_MISSING: "bg-red-50 text-red-700 border-red-200 animate-pulse",
  PARTICIPANTS_MISSING: "bg-amber-100 text-amber-800 border-amber-200",
  READY: "bg-green-100 text-green-800 border-green-200",
  PROOF_MISSING: "bg-purple-100 text-purple-800 border-purple-200",
  TO_BILL: "bg-indigo-100 text-indigo-800 border-indigo-200",
  BILLED: "bg-gray-100 text-gray-500 border-gray-200 grayscale",
};

export const STATUS_LABELS: Record<SessionStatus, string> = {
  PENDING: "En attente",
  CONFIRMED: "Confirmé",
  CANCELLED: "Annulé",
  LOGISTICS_MISSING: "Logistique manquante",
  PARTICIPANTS_MISSING: "Participants manquants",
  READY: "Prêt (J-7)",
  PROOF_MISSING: "Preuve manquante",
  TO_BILL: "A facturer",
  BILLED: "Facturé",
};
