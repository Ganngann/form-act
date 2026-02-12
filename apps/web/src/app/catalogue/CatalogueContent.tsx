"use client"

import { useEffect, useState, useCallback } from "react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Search, Loader2, ArrowRight, Clock, BookOpen, Filter } from "lucide-react"

type Category = {
  id: string
  name: string
}

type Formation = {
  id: string
  title: string
  description: string
  duration: string
  imageUrl?: string
  category?: {
    name: string
  }
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

export default function CatalogueContent() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const selectedCategory = searchParams.get("categoryId") || ""
  const currentSearch = searchParams.get("search") || ""

  const [categories, setCategories] = useState<Category[]>([])
  const [formations, setFormations] = useState<Formation[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [searchValue, setSearchValue] = useState(currentSearch)

  // Fetch categories on mount
  useEffect(() => {
    fetch(`${API_URL}/categories`)
      .then((res) => res.json())
      .then((data) => {
        setCategories(data)
        setLoadingCategories(false)
      })
      .catch((err) => {
        console.error("Error fetching categories:", err)
        setLoadingCategories(false)
      })
  }, [])

  // Sync local search state if URL changes externally
  useEffect(() => {
    setSearchValue(currentSearch)
  }, [currentSearch])

  // Helper to update URL
  const updateUrl = useCallback((updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString())
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
    })
    const newUrl = `${pathname}?${params.toString()}`
    router.push(newUrl)
  }, [searchParams, pathname, router])

  // Debounce search update
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchValue !== currentSearch) {
        updateUrl({ search: searchValue })
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [searchValue, currentSearch, updateUrl])

  // Fetch formations when params change
  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (selectedCategory) params.set("categoryId", selectedCategory)
    if (currentSearch) params.set("search", currentSearch)

    const queryString = params.toString()
    const url = `${API_URL}/formations${queryString ? `?${queryString}` : ""}`

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setFormations(data)
        setLoading(false)
      })
      .catch((err) => {
        console.error("Error fetching formations:", err)
        setLoading(false)
      })
  }, [selectedCategory, currentSearch])

  const handleCategoryChange = (val: string) => {
    updateUrl({ categoryId: val === "all" ? null : val })
  }

  return (
    <div className="flex flex-col gap-12 pb-24">
      {/* Hero Header */}
      <section className="bg-white border-b border-border pt-16 pb-20 px-4">
        <div className="container mx-auto flex flex-col items-center text-center max-w-4xl">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-[11px] font-black uppercase tracking-[3px] text-primary mb-6">
            Formation Continue
          </span>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter leading-[0.9] mb-6">
            Développez vos <br />
            <span className="text-primary italic">Compétences.</span>
          </h1>
          <p className="text-lg text-muted-foreground/80 max-w-2xl font-medium leading-relaxed">
            Parcourez notre catalogue complet de formations certifiées et trouvez le programme adapté à vos ambitions professionnelles.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 -mt-16 relative z-10">
        {/* Filters Bar */}
        <div className="bg-white rounded-[2rem] shadow-xl shadow-primary/5 border border-border p-4 flex flex-col md:flex-row gap-4 items-center max-w-5xl mx-auto">
          <div className="w-full md:w-1/3 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/50" />
            <Input
              placeholder="Rechercher une formation..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="pl-12 h-14 rounded-2xl border-border/50 bg-muted/20 focus:bg-white text-lg font-medium transition-all"
            />
          </div>

          <div className="hidden md:block w-px h-10 bg-border/60"></div>

          <div className="w-full md:w-1/3">
            <Select onValueChange={handleCategoryChange} value={selectedCategory || "all"}>
              <SelectTrigger className="h-14 rounded-2xl border-border/50 bg-muted/20 text-lg font-medium hover:bg-white transition-all">
                <div className="flex items-center gap-3">
                  <Filter className="h-5 w-5 text-primary" />
                  <SelectValue placeholder="Toutes les thématiques" />
                </div>
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-border p-2">
                <SelectItem value="all" className="rounded-xl font-bold py-3 cursor-pointer">Toutes les thématiques</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id} className="rounded-xl font-bold py-3 cursor-pointer">
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-full md:w-auto ml-auto">
            <Button className="w-full md:w-auto h-14 rounded-2xl px-8 text-lg font-black shadow-lg shadow-primary/20" disabled={loading}>
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : `${formations.length} Résultats`}
            </Button>
          </div>
        </div>

        {/* Results Grid */}
        <div className="mt-20">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="h-10 w-10 text-primary animate-spin" />
              <p className="font-bold text-muted-foreground animate-pulse">Chargement des pépites...</p>
            </div>
          ) : formations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {formations.map((formation, index) => (
                <Link
                  key={formation.id}
                  href={`/formation/${formation.id}`}
                  className="group flex flex-col bg-white border border-border rounded-[2.5rem] overflow-hidden hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 hover:-translate-y-2"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Image Area */}
                  <div className="h-64 bg-muted relative overflow-hidden">
                    {formation.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={formation.imageUrl}
                        alt={formation.title}
                        className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                        <BookOpen className="h-12 w-12 text-muted-foreground/20" />
                      </div>
                    )}
                    <div className="absolute top-4 left-4 flex gap-2">
                      <span className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-primary border border-white/20 shadow-sm">
                        {formation.category?.name || "Formation"}
                      </span>
                    </div>
                  </div>

                  {/* Content Area */}
                  <div className="p-8 flex flex-col flex-1">
                    <h3 className="text-2xl font-bold leading-tight mb-3 group-hover:text-primary transition-colors line-clamp-2">
                      {formation.title}
                    </h3>
                    <p className="text-muted-foreground text-sm font-medium line-clamp-3 mb-8 flex-1 leading-relaxed">
                      {formation.description}
                    </p>

                    <div className="flex items-center justify-between pt-6 border-t border-border/50">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span className="text-xs font-bold uppercase tracking-wider">{formation.duration}</span>
                      </div>
                      <div className="h-10 w-10 rounded-full bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                        <ArrowRight className="h-5 w-5" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed border-border rounded-[3rem] bg-muted/5">
              <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-6">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Aucun résultat trouvé</h3>
              <p className="text-muted-foreground max-w-md">
                Nous n'avons trouvé aucune formation correspondant à votre recherche. Essayez d'autres mots-clés ou parcourez toutes nos thématiques.
              </p>
              <Button
                variant="link"
                onClick={() => {
                  setSearchValue("")
                  handleCategoryChange("all")
                }}
                className="mt-6 text-primary font-bold text-lg"
              >
                Réinitialiser les filtres
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
