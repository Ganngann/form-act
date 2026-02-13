"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  User,
  Calendar,
  FileText,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

const navItems = [
  {
    href: "/trainer",
    label: "Tableau de Bord",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    href: "/trainer/profile",
    label: "Mon Profil",
    icon: User,
    exact: false,
  },
  {
    href: "/trainer/settings",
    label: "Paramètres & Sync",
    icon: Settings,
    exact: false,
  },
];

export function TrainerSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:block w-[280px] shrink-0 space-y-6">
      <nav className="flex flex-col gap-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          // Check if active: exact match for dashboard, partial for sub-routes
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-4 px-6 py-4 rounded-[1.2rem] font-bold transition-all duration-300 group relative overflow-hidden",
                isActive
                  ? "bg-white text-primary shadow-lg shadow-black/5 border border-border"
                  : "text-muted-foreground hover:text-primary hover:bg-white/50 border border-transparent",
              )}
            >
              <div
                className={cn(
                  "h-10 w-10 rounded-xl flex items-center justify-center transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "bg-transparent group-hover:bg-primary/5",
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
              <span className="text-sm font-bold z-10 relative">
                {item.label}
              </span>
              {isActive && (
                <div className="absolute inset-y-0 left-0 w-1 bg-primary rounded-r-full" />
              )}
            </Link>
          );
        })}
      </nav>

      <Card className="rounded-[1.5rem] border-primary/10 bg-gradient-to-br from-primary/5 to-transparent overflow-hidden">
        <CardContent className="p-6 relative">
          <div className="absolute top-0 right-0 w-20 h-20 bg-primary/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
          <h3 className="text-sm font-black uppercase tracking-widest text-primary mb-2">
            Besoin d&apos;aide ?
          </h3>
          <p className="text-xs text-muted-foreground font-medium mb-4 leading-relaxed">
            Consultez notre base de connaissances ou contactez le support.
          </p>
          <Link
            href="/faq"
            className="text-xs font-bold text-primary hover:underline"
          >
            Accéder à la FAQ →
          </Link>
        </CardContent>
      </Card>
    </aside>
  );
}
