"use client";

import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useEffect, useTransition } from "react";

export function SessionSearchBar() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();
    const [value, setValue] = useState(searchParams.get("q") || "");

    // Simple debounce inside useEffect if useDebounce is missing
    useEffect(() => {
        const currentQ = searchParams.get("q") || "";
        if (value === currentQ) return;

        const timer = setTimeout(() => {
            const params = new URLSearchParams(searchParams.toString());
            if (value) {
                params.set("q", value);
            } else {
                params.delete("q");
            }

            startTransition(() => {
                router.push(`${pathname}?${params.toString()}`);
            });
        }, 300);

        return () => clearTimeout(timer);
    }, [value, router, searchParams, pathname]);

    return (
        <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
                placeholder="Rechercher une formation, client..."
                className="pl-10 pr-10 rounded-xl border-slate-200 bg-white/50 focus:bg-white transition-all font-medium"
                value={value}
                onChange={(e) => setValue(e.target.value)}
            />
            {value && (
                <button
                    onClick={() => setValue("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                    <X className="h-4 w-4" />
                </button>
            )}
        </div>
    );
}
