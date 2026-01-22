"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

type Category = {
  id: string
  name: string
}

type Formation = {
  id: string
  title: string
  description: string
  duration: string
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

export default function CatalogueContent() {
  const searchParams = useSearchParams()
  const initialCategory = searchParams.get("categoryId") || ""

  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory)
  const [formations, setFormations] = useState<Formation[]>([])
  const [loading, setLoading] = useState(false)

  // Sync state with URL params if they change
  useEffect(() => {
    const cat = searchParams.get("categoryId") || ""
    if (cat !== selectedCategory) {
        setSelectedCategory(cat)
    }
  }, [searchParams])

  useEffect(() => {
    fetch(`${API_URL}/categories`)
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch((err) => console.error("Error fetching categories:", err))
  }, [])

  useEffect(() => {
    setLoading(true)
    let url = `${API_URL}/formations`
    if (selectedCategory) {
      url += `?categoryId=${selectedCategory}`
    }

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
  }, [selectedCategory])

  const handleCategoryChange = (val: string) => {
    setSelectedCategory(val === "all" ? "" : val)
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Catalogue des Formations</h1>

      <div className="mb-8 w-full md:w-1/3">
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

      {loading ? (
        <p>Chargement...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {formations.length > 0 ? (
            formations.map((formation) => (
              <Card key={formation.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle>{formation.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{formation.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                      {formation.duration}
                    </span>
                    <Button variant="outline">Voir détails</Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <p className="col-span-full text-center text-muted-foreground">
              Aucune formation disponible pour ce thème.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
