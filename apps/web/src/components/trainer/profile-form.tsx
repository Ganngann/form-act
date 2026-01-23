'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { API_URL } from '@/lib/config';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export function ProfileForm({ trainer }: { trainer: any }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
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
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg border shadow-sm space-y-6">
            <div className="flex items-center gap-6">
                <div className="relative group">
                    <div className="w-24 h-24 rounded-full overflow-hidden border bg-gray-100 relative">
                        <Image
                            src={trainer.avatarUrl ? `${API_URL}${trainer.avatarUrl}` : "https://via.placeholder.com/150?text=Avatar"}
                            alt="Avatar"
                            fill
                            className="object-cover"
                            unoptimized
                        />
                    </div>
                     <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 shadow-md transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
                        <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                    </label>
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-900">{trainer.firstName} {trainer.lastName}</h2>
                    <p className="text-gray-500">{trainer.email}</p>
                </div>
            </div>

            {/* Read-Only Specialties Section */}
            {trainer.expertises && trainer.expertises.length > 0 && (
                <div className="border-b pb-6">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Mes Spécialités (Formations Habilitées)</h3>
                    <div className="flex flex-wrap gap-2">
                        {trainer.expertises.flatMap((e: any) => e.formations).map((formation: any) => (
                            <span
                                key={formation.id}
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                            >
                                {formation.title}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Biographie</label>
                    <textarea
                        {...register('bio')}
                        rows={5}
                        className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
                        placeholder="Parlez de votre expérience, vos spécialités..."
                    />
                </div>
                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium transition-colors"
                    >
                        {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
                    </button>
                </div>
            </form>
        </div>
    );
}
