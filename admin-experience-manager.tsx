"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"

interface ContactData {
  whatsapp: string
  github_url: string
  linkedin_url: string
  twitter_url: string
}

export function AdminContactManager({ userId }: { userId: string }) {
  const { toast } = useToast()
  const supabase = createClient()!
  const [formData, setFormData] = useState<ContactData>({
    whatsapp: "",
    github_url: "",
    linkedin_url: "",
    twitter_url: "",
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    loadData()
  }, [userId])

  const loadData = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from("profiles")
        .select("whatsapp, github_url, linkedin_url, twitter_url")
        .eq("id", userId)
        .single()

      if (error) throw error

      if (data) {
        setFormData({
          whatsapp: data.whatsapp || "",
          github_url: data.github_url || "",
          linkedin_url: data.linkedin_url || "",
          twitter_url: data.twitter_url || "",
        })
      }
    } catch (error) {
      console.error("[v0] Error loading contact data:", error)
      toast({
        title: "Error",
        description: "Failed to load contact data",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const { error } = await supabase.from("profiles").update(formData).eq("id", userId)

      if (error) throw error

      toast({
        title: "Success",
        description: "Contact information saved successfully!",
        variant: "default",
      })
    } catch (error) {
      console.error("[v0] Error saving contact data:", error)
      toast({
        title: "Error",
        description: "Failed to save contact information",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">Loading contact data...</CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contact Information</CardTitle>
        <CardDescription>Manage your contact details and social links</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
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
            placeholder="https://github.com/yourprofile"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">LinkedIn URL</label>
          <Input
            name="linkedin_url"
            value={formData.linkedin_url}
            onChange={handleChange}
            placeholder="https://linkedin.com/in/yourprofile"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Twitter URL</label>
          <Input
            name="twitter_url"
            value={formData.twitter_url}
            onChange={handleChange}
            placeholder="https://twitter.com/yourprofile"
          />
        </div>
        <Button onClick={handleSave} disabled={isSaving} className="w-full">
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </CardContent>
    </Card>
  )
}
