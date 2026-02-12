"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
}

interface SearchHeroProps {
  categories: Category[];
}

export function SearchHero({ categories }: SearchHeroProps) {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  const handleSearch = () => {
    if (selectedCategory && selectedCategory !== "all") {
      router.push(`/catalogue?categoryId=${selectedCategory}`);
    } else {
      router.push("/catalogue");
    }
  };

  return (
    <div className="flex w-full max-w-2xl items-center space-x-3 bg-white/80 backdrop-blur-md p-3 rounded-[2rem] border border-border shadow-2xl shadow-primary/10">
      <div className="flex-1 flex items-center px-4">
        <Search className="h-5 w-5 text-muted-foreground mr-3" />
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full border-0 focus:ring-0 focus:ring-offset-0 bg-transparent text-lg font-bold h-12">
            <SelectValue placeholder="Quelle compétence recherchez-vous ?" />
          </SelectTrigger>
          <SelectContent className="rounded-2xl border-border shadow-2xl">
            <SelectItem value="all" className="font-bold py-3">Toutes les thématiques</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id} className="font-bold py-3">
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button
        onClick={handleSearch}
        size="lg"
        className="h-14 px-10 rounded-2xl font-black text-lg shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
      >
        Rechercher
      </Button>
    </div>
  );
}
