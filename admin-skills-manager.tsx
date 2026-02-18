"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import { Trash2, Plus, Upload, X } from "lucide-react"
import Image from "next/image"

interface Project {
  id: string
  title: string
  description: string
  image_url: string
  technologies: string[]
}

export function AdminProjectsManager({ userId }: { userId: string }) {
  const { toast } = useToast()
  const supabase = createClient()!
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [uploadingImageId, setUploadingImageId] = useState<string | null>(null)

  useEffect(() => {
    loadProjects()
  }, [userId])

  const loadProjects = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      if (error) throw error

      setProjects(
        data.map((proj) => ({
          id: proj.id,
          title: proj.title,
          description: proj.description || "",
          image_url: proj.image_url || "",
          technologies: proj.technologies || [],
        })),
      )
    } catch (error) {
      console.error("[v0] Error loading projects:", error)
      toast({
        title: "Error",
        description: "Failed to load projects data",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddProject = () => {
    setProjects([
      ...projects,
      {
        id: Date.now().toString(),
        title: "",
        description: "",
        image_url: "",
        technologies: [],
      },
    ])
  }

  const handleUpdateProject = (id: string, field: keyof Project, value: string | string[]) => {
    setProjects((prev) => prev.map((proj) => (proj.id === id ? { ...proj, [field]: value } : proj)))
  }

  const handleDeleteProject = async (id: string) => {
    try {
      if (!id.includes(".")) {
        const { error } = await supabase.from("projects").delete().eq("id", id)

        if (error) throw error
      }

      setProjects((prev) => prev.filter((proj) => proj.id !== id))
      toast({
        title: "Project deleted",
        description: "The project has been removed.",
      })
    } catch (error) {
      console.error("[v0] Error deleting project:", error)
      toast({
        title: "Error",
        description: "Failed to delete project",
        variant: "destructive",
      })
    }
  }

  const handleImageUpload = async (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingImageId(id)
    try {
      const uploadData = new FormData()
      uploadData.append("file", file)
      uploadData.append("folder", "project-images")

      const res = await fetch("/api/upload", { method: "POST", body: uploadData })
      const result = await res.json()

      if (!res.ok) throw new Error(result.error || "Upload failed")

      handleUpdateProject(id, "image_url", result.url)
      toast({
        title: "Image uploaded",
        description: "Project image has been uploaded.",
      })
    } catch (error) {
      console.error("[v0] Error uploading project image:", error)
      toast({
        title: "Upload failed",
        description: "Failed to upload project image. Please try again.",
        variant: "destructive",
      })
    } finally {
      setUploadingImageId(null)
    }
  }

  const handleDeleteImage = async (id: string) => {
    const project = projects.find((p) => p.id === id)
    if (project?.image_url && project.image_url.includes("blob.vercel-storage.com")) {
      try {
        await fetch("/api/upload/delete", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: project.image_url }),
        })
      } catch (error) {
        console.error("[v0] Error deleting blob:", error)
      }
    }
    handleUpdateProject(id, "image_url", "")
    toast({
      title: "Image removed",
      description: "Project image has been deleted.",
    })
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      for (const proj of projects) {
        if (proj.id.includes(".")) {
          // New record, insert
          const { error } = await supabase.from("projects").insert([
            {
              user_id: userId,
              title: proj.title,
              description: proj.description,
              image_url: proj.image_url,
              technologies: proj.technologies,
            },
          ])

          if (error) throw error
        } else {
          // Existing record, update
          const { error } = await supabase
            .from("projects")
            .update({
              title: proj.title,
              description: proj.description,
              image_url: proj.image_url,
              technologies: proj.technologies,
            })
            .eq("id", proj.id)

          if (error) throw error
        }
      }

      await loadProjects()
      toast({
        title: "Success",
        description: "Projects saved successfully!",
        variant: "default",
      })
    } catch (error) {
      console.error("[v0] Error saving projects:", error)
      toast({
        title: "Error",
        description: "Failed to save projects",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">Loading projects data...</CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Projects</CardTitle>
        <CardDescription>Manage your portfolio projects</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {projects.map((proj, index) => (
          <div key={proj.id} className="border rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-start">
              <h3 className="font-semibold">Project {index + 1}</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteProject(proj.id)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Project Title</label>
              <Input
                value={proj.title}
                onChange={(e) => handleUpdateProject(proj.id, "title", e.target.value)}
                placeholder="Project title"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={proj.description}
                onChange={(e) => handleUpdateProject(proj.id, "description", e.target.value)}
                placeholder="Project description"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Technologies (comma-separated)</label>
              <Input
                value={proj.technologies.join(", ")}
                onChange={(e) =>
                  handleUpdateProject(
                    proj.id,
                    "technologies",
                    e.target.value.split(",").map((t) => t.trim()),
                  )
                }
                placeholder="SolidWorks, ANSYS, CAD"
              />
            </div>
            <div className="space-y-2 border rounded-lg p-3 bg-gray-50 dark:bg-gray-800">
              <label className="text-sm font-medium">Project Image</label>
              {proj.image_url && (
                <div className="relative w-full h-48 rounded border overflow-hidden">
                  <Image src={proj.image_url || "/placeholder.svg"} alt={proj.title} fill className="object-cover" />
                  <button
                    onClick={() => handleDeleteImage(proj.id)}
                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
              <div className="flex gap-2">
                <label className="flex-1 cursor-pointer">
                  <div className="flex items-center justify-center gap-2 border-2 border-dashed border-blue-300 dark:border-blue-600 rounded px-3 py-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                    <Upload className="w-4 h-4" />
                    <span className="text-sm font-medium">Upload Image</span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(proj.id, e)}
                    disabled={uploadingImageId === proj.id}
                    className="hidden"
                  />
                </label>
                {proj.image_url && (
                  <Button
                    onClick={() => handleDeleteImage(proj.id)}
                    variant="outline"
                    size="sm"
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
        <Button onClick={handleAddProject} variant="outline" className="w-full bg-transparent">
          <Plus className="w-4 h-4 mr-2" />
          Add Project
        </Button>
        <Button onClick={handleSave} disabled={isSaving} className="w-full">
          {isSaving ? "Saving..." : "Save All Changes"}
        </Button>
      </CardContent>
    </Card>
  )
}
