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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

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
  const [searchValue, setSearchValue] = useState(currentSearch)

  // Fetch categories on mount
  useEffect(() => {
    fetch(`${API_URL}/categories`)
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch((err) => console.error("Error fetching categories:", err))
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
    }, 300)
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
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Catalogue des Formations</h1>

      <div className="flex flex-col md:flex-row gap-6 mb-8">
        <div className="w-full md:w-1/3">
          <label className="block text-sm font-medium mb-2">Filtrer par Thème</label>
          <Select onValueChange={handleCategoryChange} value={selectedCategory || "all"}>
            <SelectTrigger>
              <SelectValue placeholder="Tous les thèmes" />
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
        </div>

        <div className="w-full md:w-1/3">
          <label className="block text-sm font-medium mb-2">Recherche</label>
          <Input
            placeholder="Rechercher une formation..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <p>Chargement...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {formations.length > 0 ? (
            formations.map((formation) => (
              <Card key={formation.id} className="hover:shadow-lg transition-shadow overflow-hidden">
                {formation.imageUrl && (
                  <div className="h-48 w-full relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={formation.imageUrl}
                      alt={formation.title}
                      className="object-cover w-full h-full"
                    />
                  </div>
                )}
                <CardHeader>
                  <CardTitle>{formation.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4 line-clamp-3">{formation.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                      {formation.duration}
                    </span>
                    <Link href={`/formation/${formation.id}`}>
                      <Button variant="outline">Voir détails</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <p className="col-span-full text-center text-muted-foreground">
              Aucune formation disponible{selectedCategory || currentSearch ? " pour cette recherche" : ""}.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
