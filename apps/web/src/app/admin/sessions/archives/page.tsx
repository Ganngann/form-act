import { API_URL } from '@/lib/config';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Calendar, Search, FileText, ArrowLeft, Download } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { SessionSearchBar } from '@/components/admin/SessionSearchBar';

async function getArchivedSessions(query?: string) {
    const cookieStore = cookies();
    const token = cookieStore.get('Authentication')?.value;
    if (!token) return [];

    let url = `${API_URL}/sessions?filter=ARCHIVED`;
    if (query) url += `&q=${query}`;

    const res = await fetch(url, {
        headers: { Cookie: `Authentication=${token}` },
        cache: 'no-store',
    });

    if (!res.ok) return [];
    return res.json();
}

export default async function ArchivesPage({
    searchParams
}: {
    searchParams: { q?: string }
}) {
    const sessions = await getArchivedSessions(searchParams.q);

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div className="flex items-center gap-6">
                    <Button variant="ghost" size="icon" asChild className="h-14 w-14 rounded-2xl bg-white shadow-sm border border-slate-100 shrink-0">
                        <Link href="/admin/sessions">
                            <ArrowLeft className="h-6 w-6 text-slate-400" />
                        </Link>
                    </Button>
                    <div>
                        <span className="inline-block px-3 py-1 rounded-md bg-slate-100 border border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-600 mb-4">
                            Historique
                        </span>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-gray-900 mb-2">
                            Archives Sessions
                        </h1>
                        <p className="text-muted-foreground font-medium text-lg max-w-2xl">
                            Consultez l&apos;historique complet des prestations clôturées et facturées.
                        </p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row justify-between items-center gap-4">
                    <SessionSearchBar />

                    <Button variant="outline" size="sm" className="rounded-xl font-bold gap-2">
                        <Download className="h-4 w-4" /> Exporter (CSV)
                    </Button>
                </div>

                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent bg-slate-50/50">
                            <TableHead className="font-black uppercase tracking-widest text-[10px]">Date</TableHead>
                            <TableHead className="font-black uppercase tracking-widest text-[10px]">Formation</TableHead>
                            <TableHead className="font-black uppercase tracking-widest text-[10px]">Client</TableHead>
                            <TableHead className="font-black uppercase tracking-widest text-[10px]">Formateur</TableHead>
                            <TableHead className="font-black uppercase tracking-widest text-[10px]">Facturé le</TableHead>
                            <TableHead className="font-black uppercase tracking-widest text-[10px] text-right">Montant HT</TableHead>
                            <TableHead className="font-black uppercase tracking-widest text-[10px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sessions.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-32 text-center text-slate-400 font-medium">
                                    Aucune archive trouvée.
                                </TableCell>
                            </TableRow>
                        ) : (
                            sessions.map((session: any) => {
                                const billingData = session.billingData ? JSON.parse(session.billingData) : null;
                                return (
                                    <TableRow key={session.id} className="group transition-colors">
                                        <TableCell className="font-bold text-slate-700">
                                            {format(new Date(session.date), "dd/MM/yyyy")}
                                        </TableCell>
                                        <TableCell>
                                            <span className="font-black text-slate-900 group-hover:text-primary transition-colors">
                                                {session.formation.title}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-slate-500 font-medium">
                                            {session.client?.companyName}
                                        </TableCell>
                                        <TableCell className="text-slate-500 text-xs">
                                            {session.trainer ? `${session.trainer.firstName} ${session.trainer.lastName}` : "-"}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-100 font-bold">
                                                {session.billedAt ? format(new Date(session.billedAt), "dd/MM/yyyy") : "-"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right font-black text-slate-900">
                                            {billingData?.finalPrice || 0}€
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="sm" asChild className="rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Link href={`/admin/sessions/${session.id}`}>
                                                    Détails
                                                </Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
