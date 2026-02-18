"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import { Trash2, Plus } from "lucide-react"

interface Skill {
  id: string
  category: string
  skill_list: string[]
}

export function AdminSkillsManager({ userId }: { userId: string }) {
  const { toast } = useToast()
  const supabase = createClient()!
  const [skills, setSkills] = useState<Skill[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    loadSkills()
  }, [userId])

  const loadSkills = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from("skills")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      if (error) throw error

      setSkills(
        data.map((skill) => ({
          id: skill.id,
          category: skill.category,
          skill_list: skill.skill_list || [],
        })),
      )
    } catch (error) {
      console.error("[v0] Error loading skills:", error)
      toast({
        title: "Error",
        description: "Failed to load skills data",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddCategory = () => {
    setSkills([
      ...skills,
      {
        id: Date.now().toString(),
        category: "",
        skill_list: [],
      },
    ])
  }

  const handleUpdateCategory = (id: string, category: string) => {
    setSkills((prev) => prev.map((skill) => (skill.id === id ? { ...skill, category } : skill)))
  }

  const handleAddSkillToCategory = (id: string) => {
    setSkills((prev) =>
      prev.map((skill) => (skill.id === id ? { ...skill, skill_list: [...skill.skill_list, ""] } : skill)),
    )
  }

  const handleUpdateSkill = (categoryId: string, skillIndex: number, value: string) => {
    setSkills((prev) =>
      prev.map((skill) =>
        skill.id === categoryId
          ? {
              ...skill,
              skill_list: skill.skill_list.map((s, i) => (i === skillIndex ? value : s)),
            }
          : skill,
      ),
    )
  }

  const handleDeleteSkill = (categoryId: string, skillIndex: number) => {
    setSkills((prev) =>
      prev.map((skill) =>
        skill.id === categoryId
          ? {
              ...skill,
              skill_list: skill.skill_list.filter((_, i) => i !== skillIndex),
            }
          : skill,
      ),
    )
  }

  const handleDeleteCategory = async (id: string) => {
    try {
      if (!id.includes(".")) {
        const { error } = await supabase.from("skills").delete().eq("id", id)

        if (error) throw error
      }

      setSkills((prev) => prev.filter((skill) => skill.id !== id))
      toast({
        title: "Category deleted",
        description: "The skill category has been removed.",
      })
    } catch (error) {
      console.error("[v0] Error deleting skill category:", error)
      toast({
        title: "Error",
        description: "Failed to delete category",
        variant: "destructive",
      })
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      for (const skill of skills) {
        if (skill.id.includes(".")) {
          // New record, insert
          const { error } = await supabase.from("skills").insert([
            {
              user_id: userId,
              category: skill.category,
              skill_list: skill.skill_list,
            },
          ])

          if (error) throw error
        } else {
          // Existing record, update
          const { error } = await supabase
            .from("skills")
            .update({
              category: skill.category,
              skill_list: skill.skill_list,
            })
            .eq("id", skill.id)

          if (error) throw error
        }
      }

      await loadSkills()
      toast({
        title: "Success",
        description: "Skills saved successfully!",
        variant: "default",
      })
    } catch (error) {
      console.error("[v0] Error saving skills:", error)
      toast({
        title: "Error",
        description: "Failed to save skills",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">Loading skills data...</CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Skills</CardTitle>
        <CardDescription>Manage your professional skills</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {skills.map((skillGroup, index) => (
          <div key={skillGroup.id} className="border rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-start">
              <h3 className="font-semibold">Skill Category {index + 1}</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteCategory(skillGroup.id)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Category Name</label>
              <Input
                value={skillGroup.category}
                onChange={(e) => handleUpdateCategory(skillGroup.id, e.target.value)}
                placeholder="e.g., CAD & Design Tools"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Skills</label>
              <div className="space-y-2">
                {skillGroup.skill_list.map((skill, skillIndex) => (
                  <div key={skillIndex} className="flex gap-2">
                    <Input
                      value={skill}
                      onChange={(e) => handleUpdateSkill(skillGroup.id, skillIndex, e.target.value)}
                      placeholder="Skill name"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteSkill(skillGroup.id, skillIndex)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button onClick={() => handleAddSkillToCategory(skillGroup.id)} variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Skill
              </Button>
            </div>
          </div>
        ))}
        <Button onClick={handleAddCategory} variant="outline" className="w-full bg-transparent">
          <Plus className="w-4 h-4 mr-2" />
          Add Category
        </Button>
        <Button onClick={handleSave} disabled={isSaving} className="w-full">
          {isSaving ? "Saving..." : "Save All Changes"}
        </Button>
      </CardContent>
    </Card>
  )
}
