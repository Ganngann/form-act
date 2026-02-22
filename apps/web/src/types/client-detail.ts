export interface AuditEntry {
    date: string;
    by: string;
    changes: { field: string; old: string; new: string }[];
}

export interface ClientDetail {
    id: string;
    vatNumber: string;
    companyName: string;
    address: string;
    auditLog: string | null;
    createdAt: string;
    user: {
        email: string;
    };
    sessions: any[]; // Consider typing this more specifically if possible
}
