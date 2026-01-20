'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { API_URL } from '@/lib/config';
import { useRouter } from 'next/navigation';

interface ProofUploadWidgetProps {
    sessionId: string;
    status: string;
    proofUrl?: string | null;
}

export function ProofUploadWidget({ sessionId, status, proofUrl }: ProofUploadWidgetProps) {
    const router = useRouter();
    const [uploading, setUploading] = useState(false);

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch(`${API_URL}/sessions/${sessionId}/proof`, {
                method: 'POST',
                body: formData,
                credentials: 'include',
            });

            if (!res.ok) throw new Error('Upload failed');

            router.refresh();
        } catch (e) {
            console.error(e);
            alert("Erreur lors de l'upload de la preuve.");
        } finally {
            setUploading(false);
        }
    }, [sessionId, router]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf'],
            'image/jpeg': ['.jpg', '.jpeg'],
            'image/png': ['.png']
        },
        multiple: false
    });

    if (status === 'PROOF_RECEIVED' && proofUrl) {
        return (
            <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
                <div className="flex flex-col items-center gap-2 text-green-700">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                    <h3 className="text-lg font-semibold">Preuve de présence reçue</h3>
                    <p className="text-sm opacity-80 mb-2">Le document a été transmis avec succès.</p>
                    <a
                        href={`${API_URL}${proofUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-700 underline hover:text-green-800 text-sm font-medium"
                    >
                        Voir le document
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-xl border shadow-sm">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                📄 Preuve de présence
            </h2>

            <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                    isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
            >
                <input {...getInputProps()} />
                {uploading ? (
                    <p className="text-gray-500">Envoi en cours...</p>
                ) : (
                    <div className="space-y-2">
                        <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <p className="text-sm text-gray-600">
                            <span className="font-medium text-blue-600">Cliquez pour uploader</span> ou glissez le fichier ici
                        </p>
                        <p className="text-xs text-gray-500">PDF, JPG, PNG jusqu'à 10MB</p>
                    </div>
                )}
            </div>
        </div>
    );
}
