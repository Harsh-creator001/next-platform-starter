"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import { Upload, Trash2, X } from "lucide-react"
import Image from "next/image"

interface AboutData {
  name: string
  email: string
  about_text: string
  whatsapp: string
  github_url: string
  linkedin_url: string
  twitter_url: string
  profile_picture_url: string
}

export function AdminAboutManager({ userId }: { userId: string }) {
  const { toast } = useToast()
  const supabase = createClient()!
  
  const [formData, setFormData] = useState<AboutData>({
    name: "",
    email: "",
    about_text: "",
    whatsapp: "",
    github_url: "",
    linkedin_url: "",
    twitter_url: "",
    profile_picture_url: "",
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)

  useEffect(() => {
    loadData()
  }, [userId])

  const loadData = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

      if (error) throw error

      if (data) {
        setFormData({
          name: data.name || "",
          email: data.email || "",
          about_text: data.about_text || "",
          whatsapp: data.whatsapp || "",
          github_url: data.github_url || "",
          linkedin_url: data.linkedin_url || "",
          twitter_url: data.twitter_url || "",
          profile_picture_url: data.profile_picture_url || "",
        })
      }
    } catch (error) {
      console.error("[v0] Error loading profile:", error)
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleProfilePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploadingImage(true)
    try {
      const uploadData = new FormData()
      uploadData.append("file", file)
      uploadData.append("folder", "profile-pictures")

      const res = await fetch("/api/upload", { method: "POST", body: uploadData })
      const result = await res.json()

      if (!res.ok) throw new Error(result.error || "Upload failed")

      setFormData((prev) => ({ ...prev, profile_picture_url: result.url }))
      toast({
        title: "Image uploaded",
        description: "Profile picture has been uploaded. Click Save to persist.",
      })
    } catch (error) {
      console.error("[v0] Error uploading profile picture:", error)
      toast({
        title: "Upload failed",
        description: "Failed to upload profile picture. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUploadingImage(false)
    }
  }

  const handleDeleteProfilePicture = async () => {
    // Delete from Blob storage if it's a Blob URL
    if (formData.profile_picture_url && formData.profile_picture_url.includes("blob.vercel-storage.com")) {
      try {
        await fetch("/api/upload/delete", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: formData.profile_picture_url }),
        })
      } catch (error) {
        console.error("[v0] Error deleting blob:", error)
      }
    }
    setFormData((prev) => ({ ...prev, profile_picture_url: "" }))
    toast({
      title: "Image removed",
      description: "Profile picture has been removed. Click Save to persist.",
    })
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const { error } = await supabase.from("profiles").update(formData).eq("id", userId)

      if (error) throw error

      toast({
        title: "Success",
        description: "Profile information saved successfully!",
        variant: "default",
      })
    } catch (error) {
      console.error("[v0] Error saving profile:", error)
      toast({
        title: "Error",
        description: "Failed to save profile information",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">Loading profile data...</CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>About Section</CardTitle>
        <CardDescription>Update your profile information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
          <label className="text-sm font-medium">Profile Picture</label>
          {formData.profile_picture_url && (
            <div className="relative w-32 h-32 rounded overflow-hidden border-2 border-dashed border-gray-300 dark:border-gray-600">
              <Image
                src={formData.profile_picture_url || "/placeholder.svg"}
                alt="Profile"
                fill
                className="object-cover"
              />
              <button
                onClick={handleDeleteProfilePicture}
                className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white p-1 rounded"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
          <div className="flex gap-2">
            <label className="flex-1 cursor-pointer">
              <div className="flex items-center justify-center gap-2 border-2 border-dashed border-blue-300 dark:border-blue-600 rounded px-4 py-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                <Upload className="w-4 h-4" />
                <span className="text-sm font-medium">{isUploadingImage ? "Uploading..." : "Choose Image"}</span>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleProfilePictureUpload}
                disabled={isUploadingImage}
                className="hidden"
              />
            </label>
            {formData.profile_picture_url && (
              <Button
                onClick={handleDeleteProfilePicture}
                variant="outline"
                className="text-red-500 hover:text-red-700 bg-transparent"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Upload your profile picture (JPG, PNG, GIF)</p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Full Name</label>
          <Input name="name" value={formData.name} onChange={handleChange} placeholder="Your full name" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Email</label>
          <Input
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="your@email.com"
            type="email"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">About</label>
          <Textarea
            name="about_text"
            value={formData.about_text}
            onChange={handleChange}
            placeholder="Your professional description"
            rows={5}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">WhatsApp</label>
            <Input name="whatsapp" value={formData.whatsapp} onChange={handleChange} placeholder="+1 (555) 123-4567" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">GitHub URL</label>
            <Input
              name="github_url"
              value={formData.github_url}
              onChange={handleChange}
              placeholder="https://github.com/username"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">LinkedIn URL</label>
            <Input
              name="linkedin_url"
              value={formData.linkedin_url}
              onChange={handleChange}
              placeholder="https://linkedin.com/in/username"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Twitter URL</label>
            <Input
              name="twitter_url"
              value={formData.twitter_url}
              onChange={handleChange}
              placeholder="https://twitter.com/username"
            />
          </div>
        </div>
        <Button onClick={handleSave} disabled={isSaving} className="w-full">
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </CardContent>
    </Card>
  )
}
