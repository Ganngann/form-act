import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import "./globals.css";
import { Header } from "@/components/layout/Header";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Form-Act | Activez votre Expertise",
  description: "Plateforme moderne de formation professionnelle",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = cookies();
  const token = cookieStore.get("Authentication")?.value;
  let userRole = null;

  if (token) {
    try {
      const secret = new TextEncoder().encode(
        process.env.JWT_SECRET || "super-secret-key",
      );
      const { payload } = await jwtVerify(token, secret);
      userRole = payload.role as string;
    } catch (error) {
      // Token invalid or expired, ignore
    }
  }

  return (
    <html lang="fr">
      <body className={spaceGrotesk.className}>
        <Header userRole={userRole} />
        {children}
      </body>
    </html>
  );
}
