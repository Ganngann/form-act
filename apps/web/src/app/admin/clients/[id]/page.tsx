import { API_URL } from "@/lib/config";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { ClientEditForm } from "@/components/admin/clients/ClientEditForm";
import { ClientDetail, AuditEntry } from "@/types/client-detail";

async function getClient(id: string): Promise<ClientDetail | null> {
    const cookieStore = cookies();
    const token = cookieStore.get("Authentication")?.value;

    try {
        const res = await fetch(`${API_URL}/clients/${id}`, {
            headers: token ? { Cookie: `Authentication=${token}` } : {},
            cache: "no-store",
        });

        if (!res.ok) return null;
        return res.json();
    } catch (error) {
        console.error("Failed to fetch client:", error);
        return null;
    }
}

export default async function ClientDetailPage({ params }: { params: { id: string } }) {
    const client = await getClient(params.id);

    if (!client) {
        notFound();
    }

    const auditLogs: AuditEntry[] = client.auditLog ? JSON.parse(client.auditLog) : [];

    // Log to server console as per AC
    console.log(`Rendering ClientDetailPage for client: ${client.companyName} (${client.id})`);

    return (
        <ClientEditForm client={client} auditLogs={auditLogs} />
    );
}
