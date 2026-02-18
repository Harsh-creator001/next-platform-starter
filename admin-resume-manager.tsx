"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import { Trash2, Plus } from "lucide-react"

interface Experience {
  id: string
  position: string
  company: string
  duration: string
  description: string
}

export function AdminExperienceManager({ userId }: { userId: string }) {
  const { toast } = useToast()
  const supabase = createClient()!
  const [experiences, setExperiences] = useState<Experience[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    loadExperiences()
  }, [userId])

  const loadExperiences = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from("experience")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      if (error) throw error

      setExperiences(
        data.map((exp) => ({
          id: exp.id,
          position: exp.position,
          company: exp.company,
          duration: exp.duration,
          description: exp.description || "",
        })),
      )
    } catch (error) {
      console.error("[v0] Error loading experiences:", error)
      toast({
        title: "Error",
        description: "Failed to load experience data",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddExperience = () => {
    setExperiences([
      ...experiences,
      {
        id: Date.now().toString(),
        position: "",
        company: "",
        duration: "",
        description: "",
      },
    ])
  }

  const handleUpdateExperience = (id: string, field: keyof Experience, value: string) => {
    setExperiences((prev) => prev.map((exp) => (exp.id === id ? { ...exp, [field]: value } : exp)))
  }

  const handleDeleteExperience = async (id: string) => {
    try {
      if (!id.includes(".")) {
        const { error } = await supabase.from("experience").delete().eq("id", id)

        if (error) throw error
      }

      setExperiences((prev) => prev.filter((exp) => exp.id !== id))
      toast({
        title: "Experience deleted",
        description: "The experience entry has been removed.",
      })
    } catch (error) {
      console.error("[v0] Error deleting experience:", error)
      toast({
        title: "Error",
        description: "Failed to delete experience",
        variant: "destructive",
      })
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      for (const exp of experiences) {
        if (exp.id.includes(".")) {
          // New record, insert
          const { error } = await supabase.from("experience").insert([
            {
              user_id: userId,
              position: exp.position,
              company: exp.company,
              duration: exp.duration,
              description: exp.description,
            },
          ])

          if (error) throw error
        } else {
          // Existing record, update
          const { error } = await supabase
            .from("experience")
            .update({
              position: exp.position,
              company: exp.company,
              duration: exp.duration,
              description: exp.description,
            })
            .eq("id", exp.id)

          if (error) throw error
        }
      }

      await loadExperiences()
      toast({
        title: "Success",
        description: "Experience information saved successfully!",
        variant: "default",
      })
    } catch (error) {
      console.error("[v0] Error saving experiences:", error)
      toast({
        title: "Error",
        description: "Failed to save experience information",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">Loading experience data...</CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Experience</CardTitle>
        <CardDescription>Manage your work experience</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {experiences.map((exp, index) => (
          <div key={exp.id} className="border rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-start">
              <h3 className="font-semibold">Experience {index + 1}</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteExperience(exp.id)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Position</label>
              <Input
                value={exp.position}
                onChange={(e) => handleUpdateExperience(exp.id, "position", e.target.value)}
                placeholder="Job title"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Company</label>
              <Input
                value={exp.company}
                onChange={(e) => handleUpdateExperience(exp.id, "company", e.target.value)}
                placeholder="Company name"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Duration</label>
              <Input
                value={exp.duration}
                onChange={(e) => handleUpdateExperience(exp.id, "duration", e.target.value)}
                placeholder="2022 - Present"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={exp.description}
                onChange={(e) => handleUpdateExperience(exp.id, "description", e.target.value)}
                placeholder="Job description"
                rows={3}
              />
            </div>
          </div>
        ))}
        <Button onClick={handleAddExperience} variant="outline" className="w-full bg-transparent">
          <Plus className="w-4 h-4 mr-2" />
          Add Experience
        </Button>
        <Button onClick={handleSave} disabled={isSaving} className="w-full">
          {isSaving ? "Saving..." : "Save All Changes"}
        </Button>
      </CardContent>
    </Card>
  )
}
