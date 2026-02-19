"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Pencil, Trash2, Loader2, Eye, Ban, CheckCircle } from "lucide-react"
import { API_URL } from "@/lib/config"

interface TrainerActionsProps {
    trainerId: string
    isActive: boolean
}

export function TrainerActions({ trainerId, isActive }: TrainerActionsProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const handleToggleStatus = async () => {
        if (isActive) {
             if (!confirm("Attention : Désactiver ce compte empêchera le formateur de se connecter. Les sessions futures devront être réassignées manuellement. Continuer ?")) {
                 return;
             }
        }

        setLoading(true)
        try {
            const res = await fetch(`${API_URL}/admin/trainers/${trainerId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isActive: !isActive }),
            })
            if (res.ok) {
                router.refresh()
            } else {
                alert("Erreur lors de la mise à jour")
            }
        } catch (e) {
            alert("Erreur réseau")
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async () => {
        if (!confirm("Êtes-vous sûr de vouloir supprimer ce formateur ?")) return

        setLoading(true)
        try {
            const res = await fetch(`${API_URL}/admin/trainers/${trainerId}`, {
                method: "DELETE",
            })

            if (res.ok) {
                router.refresh()
            } else {
                const data = await res.json()
                alert(data.message || "Erreur lors de la suppression")
            }
        } catch (e) {
            alert("Erreur réseau")
        } finally {
            setLoading(false)
        }
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-gray-100 rounded-lg text-muted-foreground">
                    <span className="sr-only">Open menu</span>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl border-border shadow-xl">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem className="p-0">
                    <Link href={`/admin/trainers/${trainerId}`} className="cursor-pointer font-medium w-full flex items-center px-2 py-1.5 hover:bg-accent hover:text-accent-foreground rounded-sm">
                        <Eye className="mr-2 h-4 w-4" /> Voir le profil
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="p-0">
                    <Link href={`/admin/trainers/${trainerId}/edit`} className="cursor-pointer font-medium w-full flex items-center px-2 py-1.5 hover:bg-accent hover:text-accent-foreground rounded-sm">
                        <Pencil className="mr-2 h-4 w-4" /> Modifier
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    onClick={handleToggleStatus}
                    disabled={loading}
                    className={`cursor-pointer font-medium w-full flex items-center ${isActive ? 'text-orange-600 focus:text-orange-700 focus:bg-orange-50' : 'text-green-600 focus:text-green-700 focus:bg-green-50'}`}
                >
                    {isActive ? <Ban className="mr-2 h-4 w-4" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                    {isActive ? "Désactiver" : "Activer"}
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={handleDelete}
                    disabled={loading}
                    className="cursor-pointer text-red-600 focus:text-red-700 focus:bg-red-50 font-medium w-full flex items-center"
                >
                    <Trash2 className="mr-2 h-4 w-4" /> Supprimer
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
