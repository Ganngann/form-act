"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Menu, X, User, Zap } from "lucide-react";
import { useState } from "react";
import { LogoutButton } from "@/components/LogoutButton";

interface HeaderProps {
  userRole?: string | null;
  logoText?: string;
  logoUrl?: string;
}

export function Header({ userRole, logoText, logoUrl }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const isActive = (path: string) => pathname === path;

  const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
    <Link
      href={href}
      className={cn(
        "text-sm font-semibold transition-all duration-300 hover:text-primary",
        isActive(href) ? "text-primary opacity-100" : "text-foreground opacity-60"
      )}
      onClick={() => setIsMenuOpen(false)}
    >
      {children}
    </Link>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-[#FDFDFF]/90 backdrop-blur-xl h-[100px] flex items-center">
      <div className="container flex items-center justify-between">
        <div className="flex items-center gap-12">
          <Link href="/" className="flex items-center gap-3 group" onClick={() => setIsMenuOpen(false)}>
            {logoUrl ? (
               // eslint-disable-next-line @next/next/no-img-element
               <img
                 src={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}${logoUrl}`}
                 alt={logoText || "Logo"}
                 className="h-10 w-auto transition-transform group-hover:scale-105"
               />
            ) : (
              <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center transition-transform group-hover:scale-110">
                <Zap className="h-4 w-4 text-white fill-white" />
              </div>
            )}
            <span className="text-xl font-bold tracking-tighter text-foreground">
              {logoText || "FORM-ACT"}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <NavLink href="/">Accueil</NavLink>
            <NavLink href="/catalogue">Catalogue</NavLink>
            <NavLink href="/contact">Contact</NavLink>
          </nav>
        </div>

        {/* Desktop Auth Buttons */}
        <div className="hidden md:flex items-center gap-3">
          {userRole ? (
            <div className="flex items-center gap-3">
              <Link
                href={userRole === 'ADMIN' ? "/admin" : userRole === 'TRAINER' ? "/trainer" : "/dashboard"}
                className="flex items-center gap-4 bg-white border border-border rounded-full py-1.5 pl-4 pr-1.5 shadow-sm hover:border-primary transition-all group"
              >
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider group-hover:text-primary transition-colors">
                  {userRole === 'ADMIN' && 'Admin'}
                  {userRole === 'TRAINER' && 'Trainer'}
                  {userRole === 'CLIENT' && 'Client'}
                </span>
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center transition-transform group-hover:scale-95">
                  <User className="h-4 w-4 text-white" />
                </div>
              </Link>
              <LogoutButton />
            </div>
          ) : (
            <div className="flex items-center">
              <Button asChild className="font-bold rounded-xl px-6 shadow-lg shadow-primary/20">
                <Link href="/login">Mon Espace</Link>
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button className="md:hidden" onClick={toggleMenu}>
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-[100px] left-0 w-full border-b p-6 bg-[#FDFDFF] shadow-xl animate-in fade-in slide-in-from-top-4 duration-300">
          <nav className="flex flex-col gap-6">
            <NavLink href="/">Accueil</NavLink>
            <NavLink href="/catalogue">Catalogue</NavLink>
            <NavLink href="/contact">Contact</NavLink>

            <div className="border-t pt-6 flex flex-col gap-4">
              {!userRole ? (
                <Button asChild className="w-full font-bold shadow-lg shadow-primary/20">
                  <Link href="/login">Mon Espace</Link>
                </Button>
              ) : (
                <div className="flex flex-col gap-4">
                  <Button asChild variant="outline" className="w-full font-bold justify-between py-6 rounded-2xl">
                    <Link href={userRole === 'ADMIN' ? "/admin" : userRole === 'TRAINER' ? "/trainer" : "/dashboard"}>
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                          <User className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-foreground">Accéder à mon espace</span>
                      </div>
                      <span className="text-[10px] font-black text-muted-foreground uppercase opacity-60">{userRole}</span>
                    </Link>
                  </Button>
                  <LogoutButton />
                </div>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
