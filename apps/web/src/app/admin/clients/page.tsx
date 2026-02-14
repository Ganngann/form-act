import { API_URL } from '@/lib/config';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { Building2, Mail, Calendar, MoreHorizontal, Eye, ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

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
      <div className="p-12 text-center text-red-500 font-bold bg-red-50 rounded-[2.5rem]">
        Impossible de charger la liste des clients.
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <span className="inline-block px-3 py-1 rounded-md bg-blue-50 border border-blue-200 text-[10px] font-black uppercase tracking-widest text-blue-600 mb-4">
            Base Installée
          </span>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-gray-900 mb-2">
            Portefeuille Clients
          </h1>
          <p className="text-muted-foreground font-medium text-lg max-w-2xl">
            Suivi des entreprises partenaires et de leurs accès utilisateurs.
          </p>
        </div>
        <div className="hidden md:block">
          <div className="h-16 w-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
            <Building2 className="h-8 w-8" />
          </div>
        </div>
      </div>

      <Card className="border-none shadow-xl bg-white/50 backdrop-blur-sm rounded-[2.5rem] overflow-hidden">
        <div className="p-0">
          <Table>
            <TableHeader className="bg-gray-50/50">
              <TableRow className="hover:bg-transparent border-gray-100">
                <TableHead className="pl-8 h-14 font-bold text-gray-600 uppercase text-xs tracking-wider">Entreprise</TableHead>
                <TableHead className="h-14 font-bold text-gray-600 uppercase text-xs tracking-wider">TVA</TableHead>
                <TableHead className="h-14 font-bold text-gray-600 uppercase text-xs tracking-wider">Contact Principal</TableHead>
                <TableHead className="h-14 font-bold text-gray-600 uppercase text-xs tracking-wider">Inscription</TableHead>
                <TableHead className="pr-8 h-14 font-bold text-gray-600 uppercase text-xs tracking-wider text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((client: any) => (
                <TableRow key={client.id} className="group hover:bg-blue-50/30 border-gray-100 transition-colors">
                  <TableCell className="pl-8 py-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-900 group-hover:text-primary transition-colors">{client.companyName}</span>
                      <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-black mt-0.5">ID: {client.id.split('-')[0]}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <Badge variant="outline" className="rounded-lg font-mono text-gray-500 border-gray-200">
                      {client.vatNumber}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex items-center gap-2">
                      <Mail className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm font-medium text-gray-600">{client.user?.email || 'N/A'}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span className="text-sm font-medium">
                        {new Date(client.createdAt).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="pr-8 py-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-gray-100 rounded-lg text-muted-foreground">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-xl border-border shadow-xl">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem asChild className="cursor-pointer">
                          <Link href={`/admin/clients/${client.id}`} className="flex items-center w-full">
                            <Eye className="mr-2 h-4 w-4" /> Voir les détails
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-500 focus:text-red-600">
                          <ArrowRight className="mr-2 h-4 w-4" /> Action rapide...
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {clients.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="h-48 text-center">
                    <div className="flex flex-col items-center justify-center opacity-30">
                      <Building2 className="h-12 w-12 mb-2" />
                      <p className="font-black uppercase tracking-[0.2em] text-xs underline decoration-primary underline-offset-4">Aucun client enregistré</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
