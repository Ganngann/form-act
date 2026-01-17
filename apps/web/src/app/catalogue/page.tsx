"use client"

import { useEffect, useState } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

type Zone = {
  id: string
  name: string
  code: string
}

type Formation = {
  id: string
  title: string
  description: string
  duration: string
}

const API_URL = "http://localhost:3001"

export default function CataloguePage() {
  const [zones, setZones] = useState<Zone[]>([])
  const [selectedZone, setSelectedZone] = useState<string>("")
  const [formations, setFormations] = useState<Formation[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch(`${API_URL}/zones`)
      .then((res) => res.json())
      .then((data) => setZones(data))
      .catch((err) => console.error("Error fetching zones:", err))
  }, [])

  useEffect(() => {
    setLoading(true)
    let url = `${API_URL}/formations`
    if (selectedZone) {
      url += `?zoneId=${selectedZone}`
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
  }, [selectedZone])

  const handleZoneChange = (val: string) => {
    setSelectedZone(val === "all" ? "" : val)
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Catalogue des Formations</h1>

      <div className="mb-8 w-full md:w-1/3">
        <label className="block text-sm font-medium mb-2">Filtrer par Province</label>
        <Select onValueChange={handleZoneChange} value={selectedZone || "all"}>
          <SelectTrigger>
            <SelectValue placeholder="Toutes les provinces" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les provinces</SelectItem>
            {zones.map((zone) => (
              <SelectItem key={zone.id} value={zone.id}>
                {zone.name}
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
              Aucune formation disponible pour cette zone.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
