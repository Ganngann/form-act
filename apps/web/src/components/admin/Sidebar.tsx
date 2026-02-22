"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Calendar, Users, Briefcase, BookOpen, Tags, Settings, Archive, Palette, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';

interface NavChild {
  href: string;
  label: string;
  icon: React.ElementType;
}

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  exact?: boolean;
  children?: NavChild[];
}

const navItems: NavItem[] = [
  { href: '/admin', label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: '/admin/content', label: "Contenu", icon: Palette },
  { href: '/admin/emails', label: "Emails", icon: Mail },
  {
    href: '/admin/sessions',
    label: "Sessions",
    icon: Calendar,
    exact: true,
    children: [
      { href: '/admin/sessions/archives', label: "Archives", icon: Archive },
    ]
  },
  { href: '/admin/calendar', label: "Calendrier", icon: Calendar },
  { href: '/admin/trainers', label: "Formateurs", icon: Users },
  { href: '/admin/clients', label: "Clients", icon: Briefcase },
  { href: '/admin/formations', label: "Formations", icon: BookOpen },
  { href: '/admin/categories', label: "Catégories", icon: Tags },
  { href: '/admin/settings', label: "Paramètres", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:block w-[280px] shrink-0 space-y-6 py-6 pl-6 h-screen sticky top-0 overflow-y-auto">
      <div className="flex items-center gap-3 px-4 mb-4">
        <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
          <LayoutDashboard className="h-5 w-5" />
        </div>
        <div>
          <h2 className="font-black text-lg tracking-tight">Admin</h2>
          <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Espace de gestion</p>
        </div>
      </div>

      <nav className="flex flex-col gap-1 pr-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          // A parent is active if we're on its exact path, or on a sub-path
          // that is NOT one of its children (those will highlight themselves)
          const isChildActive = item.children?.some(c => pathname.startsWith(c.href));
          const isActive = item.exact
            ? pathname === item.href
            : !isChildActive && pathname.startsWith(item.href);

          return (
            <div key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-4 px-4 py-3 rounded-xl font-bold transition-all duration-200 group relative overflow-hidden",
                  isActive
                    ? "bg-white text-primary shadow-sm border border-border/50"
                    : "text-muted-foreground hover:text-primary hover:bg-white/50 border border-transparent"
                )}
              >
                <div className={cn(
                  "h-8 w-8 rounded-lg flex items-center justify-center transition-colors",
                  isActive ? "bg-primary/10 text-primary" : "bg-transparent group-hover:bg-primary/5"
                )}>
                  <Icon className="h-4 w-4" />
                </div>
                <span className="text-sm font-bold">{item.label}</span>
                {isActive && (
                  <div className="absolute inset-y-0 left-0 w-1 bg-primary rounded-r-full" />
                )}
              </Link>

              {/* Sub-items */}
              {item.children && (
                <div className="ml-6 pl-4 border-l-2 border-border/40 mt-0.5 mb-1 flex flex-col gap-0.5">
                  {item.children.map((child) => {
                    const ChildIcon = child.icon;
                    const isChildItemActive = pathname.startsWith(child.href);
                    return (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-bold transition-all duration-200 group",
                          isChildItemActive
                            ? "bg-white text-primary shadow-sm border border-border/50"
                            : "text-muted-foreground hover:text-primary hover:bg-white/50"
                        )}
                      >
                        <ChildIcon className={cn(
                          "h-3.5 w-3.5 shrink-0 transition-colors",
                          isChildItemActive ? "text-primary" : "text-muted-foreground group-hover:text-primary"
                        )} />
                        <span>{child.label}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="pr-4 mt-auto">
        <Card className="rounded-[1.5rem] border-primary/10 bg-gradient-to-br from-primary/5 to-transparent overflow-hidden">
          <CardContent className="p-5 relative">
            <div className="absolute top-0 right-0 w-16 h-16 bg-primary/10 rounded-full blur-2xl -mr-8 -mt-8"></div>
            <h3 className="text-xs font-black uppercase tracking-widest text-primary mb-2">Support</h3>
            <p className="text-[11px] text-muted-foreground font-medium mb-3 leading-relaxed">
              Besoin d&apos;aide technique ou d&apos;une nouvelle fonctionnalité ?
            </p>
            <Link href="/contact" className="text-[11px] font-bold text-primary hover:underline">
              Contacter le support →
            </Link>
          </CardContent>
        </Card>
      </div>
    </aside>
  );
}
