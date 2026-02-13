"use client";

import { useEffect, useState } from "react";
import { API_URL } from "@/lib/config";
import { SessionCard, Session } from "@/components/dashboard/session-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/sessions/me`, { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch sessions");
        return res.json();
      })
      .then((data) => {
        setSessions(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const upcomingSessions = sessions.filter((s) => {
    const sessionDate = new Date(s.date);
    sessionDate.setHours(0, 0, 0, 0);
    return sessionDate >= now;
  });

  const completedSessions = sessions.filter((s) => {
    const sessionDate = new Date(s.date);
    sessionDate.setHours(0, 0, 0, 0);
    return sessionDate < now;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground animate-pulse font-bold">
          Chargement de vos sessions...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold tracking-tight">Mes Sessions.</h1>
        <p className="text-muted-foreground font-medium">
          Retrouvez l&apos;historique et le planning de vos formations.
        </p>
      </div>

      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="bg-transparent border-b border-border rounded-none h-auto p-0 gap-8 mb-8">
          <TabsTrigger
            value="upcoming"
            className="bg-transparent border-none shadow-none rounded-none px-0 py-4 text-sm font-bold data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary transition-all"
          >
            À venir ({upcomingSessions.length})
          </TabsTrigger>
          <TabsTrigger
            value="completed"
            className="bg-transparent border-none shadow-none rounded-none px-0 py-4 text-sm font-bold data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary transition-all"
          >
            Historique ({completedSessions.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-0 outline-none">
          {upcomingSessions.length > 0 ? (
            <div className="grid gap-6">
              {upcomingSessions.map((session) => (
                <SessionCard key={session.id} session={session} />
              ))}
            </div>
          ) : (
            <div className="py-20 text-center bg-muted/10 rounded-[2rem] border border-border">
              <p className="mb-6 font-bold text-muted-foreground">
                Vous n&apos;avez pas de sessions à venir.
              </p>
              <Button
                asChild
                className="rounded-xl font-bold shadow-lg shadow-primary/20"
              >
                <Link href="/catalogue">Parcourir le catalogue</Link>
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="mt-0 outline-none">
          {completedSessions.length > 0 ? (
            <div className="grid gap-6">
              {completedSessions.map((session) => (
                <SessionCard key={session.id} session={session} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-muted-foreground font-bold">
                Aucune session passée à afficher.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
