"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { AdminAboutManager } from "./admin-about-manager"
import { AdminExperienceManager } from "./admin-experience-manager"
import { AdminProjectsManager } from "./admin-projects-manager"
import { AdminSkillsManager } from "./admin-skills-manager"
import { AdminContactManager } from "./admin-contact-manager"
import { AdminResumeManager } from "./admin-resume-manager"
import { LogOut } from "lucide-react"

interface User {
  id: string
  email: string
}

export function AdminDashboardContent({ user }: { user: User }) {
  const { toast } = useToast()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("about")
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      const supabase = createClient()
      if (!supabase) {
        router.push("/auth/login")
        return
      }
      await supabase.auth.signOut()
      router.push("/")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to logout",
        variant: "destructive",
      })
      setIsLoggingOut(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-2">Admin Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Logged in as: <span className="font-semibold">{user.email}</span>
            </p>
          </div>
          <Button onClick={handleLogout} disabled={isLoggingOut} variant="outline" className="gap-2 bg-transparent">
            <LogOut className="w-4 h-4" />
            {isLoggingOut ? "Logging out..." : "Logout"}
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-6 mb-8">
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="experience">Experience</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="skills">Skills</TabsTrigger>
            <TabsTrigger value="resume">Resume</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
          </TabsList>

          <TabsContent value="about">
            <AdminAboutManager userId={user.id} />
          </TabsContent>

          <TabsContent value="experience">
            <AdminExperienceManager userId={user.id} />
          </TabsContent>

          <TabsContent value="projects">
            <AdminProjectsManager userId={user.id} />
          </TabsContent>

          <TabsContent value="skills">
            <AdminSkillsManager userId={user.id} />
          </TabsContent>

          <TabsContent value="resume">
            <AdminResumeManager userId={user.id} />
          </TabsContent>

          <TabsContent value="contact">
            <AdminContactManager userId={user.id} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
