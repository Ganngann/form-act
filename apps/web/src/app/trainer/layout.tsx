"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export default function TrainerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const u = auth.getUser();
    if (!u) {
      router.push("/login");
      return;
    }
    if (u.role !== "TRAINER") {
      router.push("/");
      return;
    }
    setUser(u);
  }, [router]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">Espace Formateur</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {user.formateur?.firstName} {user.formateur?.lastName}
            </span>
            <Button variant="outline" size="sm" onClick={() => auth.logout()}>
              Déconnexion
            </Button>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
