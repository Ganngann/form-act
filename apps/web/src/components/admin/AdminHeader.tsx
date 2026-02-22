import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import React from 'react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface AdminHeaderProps {
  title: string;
  description?: string;
  badge?: string;
  badgeClassName?: string;
  backLink?: string;
  children?: React.ReactNode;
  className?: string;
  // New props
  breadcrumbs?: BreadcrumbItem[];
  statusBadge?: React.ReactNode;
  actions?: React.ReactNode;
}

export function AdminHeader({
  title,
  description,
  badge,
  badgeClassName,
  backLink,
  children,
  className,
  breadcrumbs,
  statusBadge,
  actions,
}: AdminHeaderProps) {
  const contentActions = actions || children;

  return (
    <div className={cn("flex flex-col md:flex-row justify-between items-start md:items-end gap-6", className)}>
      <div className="flex flex-1 items-start gap-4 min-w-0">
        {backLink && (
          <Button variant="outline" size="icon" asChild className="rounded-xl h-10 w-10 border-border bg-white shadow-sm shrink-0 mt-1">
            <Link href={backLink} aria-label="Retour">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
        )}

        <div className="flex-1 min-w-0">
          {/* Breadcrumbs */}
          {breadcrumbs && breadcrumbs.length > 0 && (
            <nav className="flex items-center text-sm text-muted-foreground mb-4 flex-wrap">
              {breadcrumbs.map((item, index) => (
                <div key={index} className="flex items-center">
                  {index > 0 && <span className="mx-2 text-slate-300">/</span>}
                  {item.href ? (
                    <Link href={item.href} className="hover:text-foreground transition-colors">
                      {item.label}
                    </Link>
                  ) : (
                    <span className="font-medium text-foreground cursor-default">{item.label}</span>
                  )}
                </div>
              ))}
            </nav>
          )}

          {/* Existing Badge */}
          {badge && (
            <span className={cn(
              "inline-block px-3 py-1 rounded-md border text-[10px] font-black uppercase tracking-widest mb-4",
              badgeClassName || "bg-primary/5 border-primary/20 text-primary"
            )}>
              {badge}
            </span>
          )}

          {/* Title + Status Badge */}
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tighter text-gray-900 break-words">
              {title}
            </h1>
            {statusBadge && (
              <div className="shrink-0">
                {statusBadge}
              </div>
            )}
          </div>

          {description && (
            <p className="text-muted-foreground font-medium text-lg max-w-2xl">
              {description}
            </p>
          )}
        </div>
      </div>

      {/* Actions (New or Legacy Children) */}
      {contentActions && (
        <div className="flex items-center gap-4 shrink-0 self-start md:self-end">
          {contentActions}
        </div>
      )}
    </div>
  );
}
