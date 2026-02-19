import type { Metadata } from 'next';
import { Space_Grotesk } from 'next/font/google';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import './globals.css';
import { getJwtSecretKey } from '@/lib/auth.config';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { getSiteConfig } from '@/lib/api-config';
import { GlobalConfig } from '@/types/configuration';

const spaceGrotesk = Space_Grotesk({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'Form-Act | Activez votre Expertise',
    description: 'Plateforme moderne de formation professionnelle',
};

export default async function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const cookieStore = cookies();
    const token = cookieStore.get('Authentication')?.value;
    let userRole = null;

    if (token) {
        try {
            const secret = getJwtSecretKey();
            const { payload } = await jwtVerify(token, secret);
            userRole = payload.role as string;
        } catch (error) {
            // Token invalid or expired, ignore
        }
    }

    const globalConfig = await getSiteConfig<GlobalConfig>("global_settings");
    const logoText = globalConfig?.logoText || "FORM-ACT";
    const logoUrl = globalConfig?.logoUrl;
    const faviconUrl = globalConfig?.faviconUrl;

    return (
        <html lang="fr">
            <head>
                {faviconUrl && <link rel="icon" href={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}${faviconUrl}`} />}
            </head>
            <body className={spaceGrotesk.className}>
                <Header userRole={userRole} logoText={logoText} logoUrl={logoUrl} />
                {children}
                <Footer />
            </body>
        </html>
    );
}
