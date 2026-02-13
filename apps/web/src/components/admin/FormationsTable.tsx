"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  XCircle,
  MoreHorizontal,
  Search,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Formation, Category, Trainer } from "@/types/formation";
import { FormationDialog } from "@/components/admin/FormationDialog";
import { adminFormationsService } from "@/services/admin-formations";

interface FormationsTableProps {
  initialFormations: Formation[];
  categories: Category[];
  trainers: Trainer[];
}

export function FormationsTable({
  initialFormations,
  categories,
  trainers,
}: FormationsTableProps) {
  const router = useRouter();
  const [formations] = useState(initialFormations);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedFormation, setSelectedFormation] = useState<Formation | null>(
    null,
  );
  const [searchTerm, setSearchTerm] = useState("");

  const handleCreate = () => {
    setSelectedFormation(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (formation: Formation) => {
    setSelectedFormation(formation);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette formation ?")) {
      try {
        await adminFormationsService.deleteFormation(id);
        router.refresh();
      } catch (error) {
        alert("Erreur lors de la suppression (impossible si sessions liées)");
      }
    }
  };

  const handleSuccess = () => {
    router.refresh();
  };

  // Basic client-side filtering
  const filteredFormations = formations.filter(
    (f) =>
      f.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.category?.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">
            Catalogue Formations
          </h2>
          <p className="text-muted-foreground font-medium mt-1">
            Gérez votre offre de formation et vos programmes.
          </p>
        </div>
        <Button
          onClick={handleCreate}
          className="rounded-xl font-bold h-11 px-6 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all"
        >
          <Plus className="mr-2 h-5 w-5" />
          Nouvelle Formation
        </Button>
      </div>

      <Card className="border-none shadow-xl bg-white/50 backdrop-blur-sm rounded-[2.5rem] overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex gap-4 items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher une formation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-11 rounded-xl bg-white border-transparent shadow-sm focus-visible:ring-primary/20 font-medium"
            />
          </div>
          {/* Future filters could go here */}
        </div>

        <div className="p-0">
          <Table>
            <TableHeader className="bg-gray-50/50">
              <TableRow className="hover:bg-transparent border-gray-100">
                <TableHead className="pl-8 h-14 font-bold text-gray-600 uppercase text-xs tracking-wider">
                  Formation
                </TableHead>
                <TableHead className="h-14 font-bold text-gray-600 uppercase text-xs tracking-wider">
                  Catégorie
                </TableHead>
                <TableHead className="h-14 font-bold text-gray-600 uppercase text-xs tracking-wider">
                  Type
                </TableHead>
                <TableHead className="h-14 font-bold text-gray-600 uppercase text-xs tracking-wider">
                  Prix HT
                </TableHead>
                <TableHead className="h-14 font-bold text-gray-600 uppercase text-xs tracking-wider">
                  État
                </TableHead>
                <TableHead className="pr-8 h-14 font-bold text-gray-600 uppercase text-xs tracking-wider text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFormations.map((formation) => (
                <TableRow
                  key={formation.id}
                  className="group hover:bg-blue-50/30 border-gray-100 cursor-pointer transition-colors"
                  onClick={() => handleEdit(formation)}
                >
                  <TableCell className="pl-8 py-4 font-bold text-gray-900 group-hover:text-primary transition-colors">
                    {formation.title}
                    {formation.duration && (
                      <span className="block text-xs text-muted-foreground font-normal mt-0.5">
                        {formation.duration}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="py-4">
                    {formation.category ? (
                      <Badge
                        variant="secondary"
                        className="rounded-lg font-bold bg-gray-100 text-gray-600 hover:bg-gray-200 border-transparent"
                      >
                        {formation.category.name}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="py-4">
                    {formation.isExpertise ? (
                      <Badge className="rounded-lg font-bold bg-amber-100 text-amber-700 hover:bg-amber-200 border-transparent">
                        Expertise
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="rounded-lg font-medium text-gray-500 border-gray-200"
                      >
                        Standard
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="py-4 font-mono font-medium text-gray-700">
                    {formation.price ? `${formation.price} €` : "-"}
                  </TableCell>
                  <TableCell className="py-4">
                    {formation.isPublished ? (
                      <div className="flex items-center gap-1.5 status-badge-published">
                        <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
                        <span className="text-xs font-bold text-green-700">
                          Publié
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 status-badge-draft">
                        <div className="h-2 w-2 rounded-full bg-gray-300" />
                        <span className="text-xs font-bold text-gray-500">
                          Brouillon
                        </span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="pr-8 py-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        asChild
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button
                          variant="ghost"
                          className="h-8 w-8 p-0 hover:bg-gray-100 rounded-lg text-muted-foreground"
                        >
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="rounded-xl border-border shadow-xl"
                      >
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() => handleEdit(formation)}
                          className="cursor-pointer font-medium"
                        >
                          <Pencil className="mr-2 h-4 w-4" /> Modifier
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDelete(formation.id)}
                          className="cursor-pointer text-red-600 focus:text-red-700 focus:bg-red-50 font-medium"
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {filteredFormations.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-32 text-center text-muted-foreground font-medium"
                  >
                    Aucune formation trouvée.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <FormationDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        formation={selectedFormation}
        categories={categories}
        trainers={trainers}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
