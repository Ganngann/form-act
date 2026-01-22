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
    <div className="flex w-full max-w-sm items-center space-x-2 bg-background/95 p-2 rounded-lg border shadow-sm">
      <Select value={selectedCategory} onValueChange={setSelectedCategory}>
        <SelectTrigger className="w-full border-0 focus:ring-0 focus:ring-offset-0">
          <SelectValue placeholder="Choisir un thème..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tous les thèmes</SelectItem>
          {categories.map((category) => (
            <SelectItem key={category.id} value={category.id}>
              {category.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button onClick={handleSearch} size="icon">
        <Search className="h-4 w-4" />
        <span className="sr-only">Rechercher</span>
      </Button>
    </div>
  );
}
