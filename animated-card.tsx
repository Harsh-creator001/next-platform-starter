"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import { Upload, Download, Trash2 } from "lucide-react"

export function AdminResumeManager({ userId }: { userId: string }) {
  const { toast } = useToast()
  const supabase = createClient()!
  const [resumeFile, setResumeFile] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    loadResume()
  }, [userId])

  const loadResume = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase.from("profiles").select("resume_url").eq("id", userId).single()

      if (error) throw error

      if (data?.resume_url) {
        setResumeFile(data.resume_url)
        setFileName("resume.pdf")
      }
    } catch (error) {
      console.error("[v0] Error loading resume:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const [isUploading, setIsUploading] = useState(false)

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.includes("pdf")) {
      toast({
        title: "Invalid file",
        description: "Please upload a PDF file",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)
    try {
      const uploadData = new FormData()
      uploadData.append("file", file)
      uploadData.append("folder", "resumes")

      const res = await fetch("/api/upload", { method: "POST", body: uploadData })
      const result = await res.json()

      if (!res.ok) throw new Error(result.error || "Upload failed")

      setResumeFile(result.url)
      setFileName(file.name)
      toast({
        title: "Resume uploaded",
        description: "Your resume has been uploaded. Click Save to persist.",
      })
    } catch (error) {
      console.error("[v0] Error uploading resume:", error)
      toast({
        title: "Upload failed",
        description: "Failed to upload resume. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const { error } = await supabase.from("profiles").update({ resume_url: resumeFile }).eq("id", userId)

      if (error) throw error

      toast({
        title: "Success",
        description: "Resume saved successfully!",
        variant: "default",
      })
    } catch (error) {
      console.error("[v0] Error saving resume:", error)
      toast({
        title: "Error",
        description: "Failed to save resume",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteResume = async () => {
    try {
      // Delete from Blob storage if it's a Blob URL
      if (resumeFile && resumeFile.includes("blob.vercel-storage.com")) {
        await fetch("/api/upload/delete", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: resumeFile }),
        })
      }

      const { error } = await supabase.from("profiles").update({ resume_url: null }).eq("id", userId)

      if (error) throw error

      setResumeFile(null)
      setFileName("")
      toast({
        title: "Resume deleted",
        description: "Your resume has been removed.",
      })
    } catch (error) {
      console.error("[v0] Error deleting resume:", error)
      toast({
        title: "Error",
        description: "Failed to delete resume",
        variant: "destructive",
      })
    }
  }

  const handleDownload = () => {
    if (resumeFile) {
      const link = document.createElement("a")
      link.href = resumeFile
      link.download = fileName
      link.click()
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">Loading resume data...</CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resume</CardTitle>
        <CardDescription>Upload and manage your resume</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="border-2 border-dashed rounded-lg p-8 text-center">
          <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h3 className="font-semibold mb-2">Upload Your Resume</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Drag and drop your PDF resume here, or click to select
          </p>
          <input type="file" accept=".pdf" onChange={handleResumeUpload} disabled={isUploading} className="hidden" id="resume-input" />
          <Button asChild variant="outline" disabled={isUploading}>
            <label htmlFor="resume-input" className="cursor-pointer">
              {isUploading ? "Uploading..." : "Choose File"}
            </label>
          </Button>
        </div>

        {resumeFile && (
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">{fileName}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Resume file ready</p>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleDownload} variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button
                  onClick={handleDeleteResume}
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        <Button onClick={handleSave} disabled={isSaving} className="w-full">
          {isSaving ? "Saving..." : "Save Resume"}
        </Button>
      </CardContent>
    </Card>
  )
}
