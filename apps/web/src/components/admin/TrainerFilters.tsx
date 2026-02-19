"use client";

import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useDebounce } from '@/hooks/use-debounce';
import { useEffect, useState } from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

export function TrainerFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [includeInactive, setIncludeInactive] = useState(searchParams.get('includeInactive') === 'true');

  const debouncedSearch = useDebounce(search, 300);

  // Sync state with URL params (handle back/forward navigation)
  useEffect(() => {
    setSearch(searchParams.get('q') || '');
    setIncludeInactive(searchParams.get('includeInactive') === 'true');
  }, [searchParams]);

  useEffect(() => {
    const finalParams = new URLSearchParams();
    if (debouncedSearch) finalParams.set('q', debouncedSearch);
    if (includeInactive) finalParams.set('includeInactive', 'true');

    const currentQ = searchParams.get('q') || '';
    const currentInactive = searchParams.get('includeInactive') === 'true';

    if (currentQ !== debouncedSearch || currentInactive !== includeInactive) {
       router.push(`${pathname}?${finalParams.toString()}`);
    }

  }, [debouncedSearch, includeInactive, pathname, router, searchParams]);

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between w-full p-6 border-b border-gray-100">
      <div className="relative flex-1 max-w-sm w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher un formateur..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 h-11 rounded-xl bg-white border-transparent shadow-sm focus-visible:ring-primary/20 font-medium"
        />
      </div>
      <div className="flex items-center gap-3 bg-gray-50/50 px-4 py-2 rounded-xl border border-gray-100">
        <Switch
            id="include-inactive"
            checked={includeInactive}
            onCheckedChange={setIncludeInactive}
            className="data-[state=checked]:bg-orange-500"
        />
        <Label htmlFor="include-inactive" className="text-sm font-bold text-gray-600 cursor-pointer">
            Afficher les inactifs
        </Label>
      </div>
    </div>
  );
}
