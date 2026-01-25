import { API_URL } from '@/lib/config';
import { cookies } from 'next/headers';
import { LogoutButton } from '@/components/LogoutButton';
import Link from 'next/link';

async function getClients() {
  const cookieStore = cookies();
  const token = cookieStore.get('Authentication')?.value;

  if (!token) return null;

  const res = await fetch(`${API_URL}/clients`, {
    headers: { Cookie: `Authentication=${token}` },
    cache: 'no-store',
  });

  if (!res.ok) return null;

  return res.json();
}

export default async function ClientsPage() {
  const clients = await getClients();

  if (!clients) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Clients</h1>
        <p className="text-red-500">Impossible de charger la liste des clients.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Clients</h1>
          <p className="text-muted-foreground">Gestion des entreprises clientes.</p>
        </div>
      </div>

      <div className="rounded-md border bg-white">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 font-medium text-gray-500">Entreprise</th>
              <th className="px-6 py-3 font-medium text-gray-500">TVA</th>
              <th className="px-6 py-3 font-medium text-gray-500">Email (User)</th>
              <th className="px-6 py-3 font-medium text-gray-500">Inscription</th>
              <th className="px-6 py-3 font-medium text-gray-500 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {clients.map((client: any) => (
              <tr key={client.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-900">{client.companyName}</td>
                <td className="px-6 py-4 text-gray-500">{client.vatNumber}</td>
                <td className="px-6 py-4 text-gray-500">{client.user?.email || 'N/A'}</td>
                <td className="px-6 py-4 text-gray-500">
                  {new Date(client.createdAt).toLocaleDateString('fr-FR')}
                </td>
                <td className="px-6 py-4 text-right">
                  <Link
                    href={`/admin/clients/${client.id}`}
                    className="text-blue-600 hover:text-blue-900 font-medium"
                  >
                    Détails
                  </Link>
                </td>
              </tr>
            ))}
            {clients.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                  Aucun client enregistré.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
