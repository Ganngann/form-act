'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { API_URL } from '@/lib/config';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { UploadCloud, Save, Loader2, Camera } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ProfileForm({ trainer }: { trainer: any }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const { register, handleSubmit } = useForm({
        defaultValues: {
            bio: trainer.bio || '',
        }
    });

    const onSubmit = async (data: any) => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/trainers/${trainer.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ bio: data.bio }),
                credentials: 'include',
            });

            if (!res.ok) throw new Error('Update failed');

            router.refresh();
        } catch (e) {
            console.error(e);
            alert('Erreur lors de la mise à jour du profil');
        } finally {
            setLoading(false);
        }
    };

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0]) return;
        const file = e.target.files[0];
        const formData = new FormData();
        formData.append('file', file);

        setUploadingAvatar(true);
        try {
            const res = await fetch(`${API_URL}/trainers/${trainer.id}/avatar`, {
                method: 'POST',
                body: formData,
                credentials: 'include',
            });

            if (!res.ok) throw new Error('Upload failed');

            router.refresh();
        } catch (e) {
            console.error(e);
            alert('Erreur lors de l\'upload de l\'avatar');
        } finally {
            setUploadingAvatar(false);
        }
    };

    const initials = `${trainer.firstName[0]}${trainer.lastName[0]}`.toUpperCase();

    return (
        <div className="space-y-8">
            {/* Avatar Upload Section */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 bg-muted/5 p-6 rounded-2xl border border-dashed border-border">
                <div className="relative group shrink-0">
                    <Avatar className="h-20 w-20 border-2 border-white shadow-sm">
                        <AvatarImage src={trainer.avatarUrl ? `${API_URL}${trainer.avatarUrl}` : undefined} className="object-cover" />
                        <AvatarFallback className="bg-primary/10 text-primary font-bold">{initials}</AvatarFallback>
                    </Avatar>
                    <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Camera className="h-6 w-6 text-white" />
                    </div>
                    <input
                        type="file"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        disabled={uploadingAvatar}
                    />
                </div>
                <div className="space-y-1">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                        Photo de profil
                        {uploadingAvatar && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        Cliquez sur l'image pour modifier. Format JPG, PNG ou GIF.
                    </p>
                </div>
            </div>


            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="bio" className="text-sm font-bold text-gray-700">Biographie</Label>
                    <Textarea
                        id="bio"
                        {...register('bio')}
                        rows={6}
                        className="bg-muted/5 border-border focus:bg-white transition-colors p-4 rounded-xl resize-none"
                        placeholder="Parlez de votre expérience, votre parcours et vos méthodes pédagogiques..."
                    />
                    <p className="text-xs text-muted-foreground text-right">
                        Cette description sera visible par les administrateurs et clients potentiels.
                    </p>
                </div>

                {/* Read-Only Specialties Section */}
                {trainer.expertises && trainer.expertises.length > 0 && (
                    <div className="space-y-3 pt-2">
                        <Label className="text-sm font-bold text-gray-700">Expertises validées</Label>
                        <div className="flex flex-wrap gap-2 p-4 bg-muted/5 rounded-xl border border-border/50">
                            {trainer.expertises.flatMap((e: any) => e.formations).map((formation: any) => (
                                <Badge
                                    key={formation.id}
                                    variant="secondary"
                                    className="bg-white hover:bg-white text-muted-foreground border border-border shadow-sm px-3 py-1 text-xs"
                                >
                                    {formation.title}
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}

                <div className="flex justify-end pt-4">
                    <Button
                        type="submit"
                        disabled={loading}
                        className="font-bold px-8 rounded-xl h-11"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enregistrement...
                            </>
                        ) : (
                            <>
                                <Save className="mr-2 h-4 w-4" /> Enregistrer les modifications
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}

