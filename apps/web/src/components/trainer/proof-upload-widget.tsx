'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { API_URL } from '@/lib/config';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, UploadCloud, FileText, Loader2, FileCheck } from 'lucide-react';
import { cn } from '@/lib/utils'; // Assuming you have a utils file

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
            // Note: In a real app, you might need to handle the token here or ensure cookies are sent
            const res = await fetch(`${API_URL}/sessions/${sessionId}/proof`, {
                method: 'POST',
                body: formData,
                // credentials: 'include' is important if your API relies on cookies
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
            <Card className="rounded-[2rem] border-green-200 bg-green-50/50 shadow-sm overflow-hidden">
                <CardContent className="p-8 text-center flex flex-col items-center justify-center space-y-4">
                    <div className="h-16 w-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-2">
                        <CheckCircle2 className="h-8 w-8" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-green-800 mb-1">Preuve Reçue</h3>
                        <p className="text-green-700 font-medium">Le document a été validé.</p>
                    </div>
                    <Button asChild variant="outline" className="bg-white border-green-200 text-green-700 hover:bg-green-100 hover:text-green-800 rounded-xl mt-4 font-bold">
                        <a href={`${API_URL}${proofUrl}`} target="_blank" rel="noopener noreferrer">
                            <FileCheck className="mr-2 h-4 w-4" /> Voir le document
                        </a>
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="rounded-[2rem] border-dashed border-2 border-border shadow-none bg-muted/5 group hover:border-primary/50 transition-colors cursor-pointer" {...getRootProps()}>
            <input {...getInputProps()} />
            <CardContent className="p-8 flex flex-col items-center justify-center text-center min-h-[250px]">
                {uploading ? (
                    <div className="space-y-4 animate-in fade-in zoom-in">
                        <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto" />
                        <p className="text-muted-foreground font-bold">Upload en cours...</p>
                    </div>
                ) : (
                    <div className={cn("space-y-4 transition-all duration-300", isDragActive ? "scale-105" : "")}>
                        <div className={cn("h-16 w-16 rounded-2xl flex items-center justify-center mx-auto transition-colors",
                            isDragActive ? "bg-primary text-white" : "bg-white text-primary shadow-sm border border-border"
                        )}>
                            <UploadCloud className="h-8 w-8" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-gray-900 mb-2">Preuve de présence</h3>
                            <p className="text-muted-foreground text-sm max-w-[200px] mx-auto leading-relaxed">
                                <span className="font-bold text-primary">Cliquez</span> ou glissez votre feuille de présence signée ici.
                            </p>
                        </div>
                        <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground/60 border border-border px-2 py-1 rounded-full inline-block">
                            PDF, JPG, PNG (Max 10MB)
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
