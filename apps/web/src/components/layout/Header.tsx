"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Menu, X, User, LogOut } from "lucide-react";
import { useState } from "react";

interface HeaderProps {
  userRole?: string | null;
}

export function Header({ userRole }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const isActive = (path: string) => pathname === path;

  const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
    <Link
      href={href}
      className={cn(
        "text-sm font-medium transition-colors hover:text-primary",
        isActive(href) ? "text-primary font-bold" : "text-muted-foreground"
      )}
      onClick={() => setIsMenuOpen(false)}
    >
      {children}
    </Link>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center space-x-2" onClick={() => setIsMenuOpen(false)}>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              Form-Act
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <NavLink href="/">Accueil</NavLink>
            <NavLink href="/catalogue">Catalogue</NavLink>

            {userRole === "ADMIN" && (
              <NavLink href="/admin">Dashboard Admin</NavLink>
            )}
            {userRole === "TRAINER" && (
              <NavLink href="/trainer">Espace Formateur</NavLink>
            )}
            {userRole === "CLIENT" && (
              <NavLink href="/dashboard">Mes Formations</NavLink>
            )}
          </nav>
        </div>

        {/* Desktop Auth Buttons */}
        <div className="hidden md:flex items-center gap-4">
          {userRole ? (
            <div className="flex items-center gap-4">
               <span className="text-sm text-muted-foreground">
                  {userRole === 'ADMIN' && 'Administrateur'}
                  {userRole === 'TRAINER' && 'Formateur'}
                  {userRole === 'CLIENT' && 'Client'}
               </span>
               <form action="/auth/logout" method="POST">
                   {/* Note: In a real app we might use a server action or client handler,
                       but for now assuming there is a way to logout or just link to logout if implemented.
                       Currently checking existing auth. Use Button as Link for now if no logout endpoint.
                    */}
                    {/* The backlog doesn't explicitly mention a logout button in the header but it's good practice.
                        I'll use a simple Link to login if not logged in.
                        If logged in, I'll just show the role for now, or maybe a logout button if I can verify the logout flow.
                    */}
                   {/* Checking previous memory: POST /auth/logout clears cookie.
                       Since this is a client component, I can't easily do a POST form submission without a server action or fetch.
                       I'll add a logout button that calls an API route.
                   */}
               </form>
               <Button variant="ghost" size="icon" asChild>
                 <Link href="/profile">
                   <User className="h-5 w-5" />
                 </Link>
               </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" asChild>
                <Link href="/login">Se connecter</Link>
              </Button>
              <Button asChild>
                <Link href="/register">S&apos;inscrire</Link>
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
        <div className="md:hidden border-t p-4 bg-background">
          <nav className="flex flex-col gap-4">
            <NavLink href="/">Accueil</NavLink>
            <NavLink href="/catalogue">Catalogue</NavLink>

            {userRole === "ADMIN" && <NavLink href="/admin">Dashboard Admin</NavLink>}
            {userRole === "TRAINER" && <NavLink href="/trainer">Espace Formateur</NavLink>}
            {userRole === "CLIENT" && <NavLink href="/dashboard">Mes Formations</NavLink>}

            <div className="border-t pt-4 flex flex-col gap-2">
              {!userRole ? (
                <>
                  <Button variant="ghost" asChild className="w-full justify-start">
                    <Link href="/login">Se connecter</Link>
                  </Button>
                  <Button asChild className="w-full justify-start">
                    <Link href="/register">S&apos;inscrire</Link>
                  </Button>
                </>
              ) : (
                 <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span>Connecté en tant que {userRole}</span>
                 </div>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
