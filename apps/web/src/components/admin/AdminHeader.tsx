import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface AdminHeaderProps {
  title: string;
  description?: string;
  badge?: string;
  badgeClassName?: string;
  backLink?: string;
  children?: React.ReactNode;
  className?: string;
}

export function AdminHeader({
  title,
  description,
  badge,
  badgeClassName,
  backLink,
  children,
  className,
}: AdminHeaderProps) {
  return (
    <div className={cn("flex flex-col md:flex-row justify-between items-start md:items-end gap-6", className)}>
      <div className="flex flex-1 items-start gap-4 min-w-0">
        {backLink && (
          <Button variant="outline" size="icon" asChild className="rounded-xl h-10 w-10 border-border bg-white shadow-sm shrink-0 mt-1">
            <Link href={backLink}>
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
        )}

        <div className="flex-1 min-w-0">
          {badge && (
            <span className={cn(
              "inline-block px-3 py-1 rounded-md border text-[10px] font-black uppercase tracking-widest mb-4",
              badgeClassName || "bg-primary/5 border-primary/20 text-primary"
            )}>
              {badge}
            </span>
          )}

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tighter text-gray-900 mb-2 break-words">
            {title}
          </h1>

          {description && (
            <p className="text-muted-foreground font-medium text-lg max-w-2xl">
              {description}
            </p>
          )}
        </div>
      </div>

      {children && (
        <div className="flex items-center gap-4 shrink-0 self-start md:self-end">
          {children}
        </div>
      )}
    </div>
  );
}
