"use server"

import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

// Helper function to create Supabase client with service role
async function getSupabaseClient() {
  const cookieStore = await cookies()
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL || "", process.env.SUPABASE_SERVICE_ROLE_KEY || "", {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        } catch {
          // Silently fail for set cookies
        }
      },
    },
  })
}

export async function sendContactEmail(data: {
  name: string
  email: string
  subject: string
  message: string
}) {
  try {
    const supabase = await getSupabaseClient()

    const { error } = await supabase.from("contact_messages").insert([
      {
        name: data.name,
        email: data.email,
        subject: data.subject,
        message: data.message,
        created_at: new Date().toISOString(),
      },
    ])

    if (error) throw error

    return {
      success: true,
      message: "Your message has been received!",
    }
  } catch (error) {
    console.error("[v0] Contact form error:", error)
    return {
      success: false,
      error: "An error occurred. Please try again later.",
    }
  }
}

// PROFILE OPERATIONS
export async function updateProfile(
  userId: string,
  data: {
    name?: string
    email?: string
    about_text?: string
    whatsapp?: string
    github_url?: string
    linkedin_url?: string
    twitter_url?: string
    profile_images?: Record<string, string>
    resume_url?: string
  },
) {
  try {
    const supabase = await getSupabaseClient()

    const { data: profile, error } = await supabase.from("profiles").update(data).eq("id", userId).select()

    if (error) {
      console.error("[v0] Profile update error:", error)
      return { success: false, error: error.message }
    }

    return { success: true, data: profile?.[0] }
  } catch (error) {
    console.error("[v0] Profile update error:", error)
    return { success: false, error: "Failed to update profile" }
  }
}

export async function getProfile(userId: string) {
  try {
    const supabase = await getSupabaseClient()

    const { data: profile, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

    if (error) {
      console.error("[v0] Profile fetch error:", error)
      return { success: false, error: error.message }
    }

    return { success: true, data: profile }
  } catch (error) {
    console.error("[v0] Profile fetch error:", error)
    return { success: false, error: "Failed to fetch profile" }
  }
}

// EXPERIENCE OPERATIONS
export async function createExperience(
  userId: string,
  data: {
    position: string
    company: string
    duration: string
    description: string
  },
) {
  try {
    const supabase = await getSupabaseClient()

    const { data: experience, error } = await supabase
      .from("experience")
      .insert([{ user_id: userId, ...data }])
      .select()

    if (error) throw error
    return { success: true, data: experience?.[0] }
  } catch (error) {
    console.error("[v0] Experience create error:", error)
    return { success: false, error: "Failed to create experience" }
  }
}

export async function updateExperience(
  userId: string,
  experienceId: string,
  data: {
    position?: string
    company?: string
    duration?: string
    description?: string
  },
) {
  try {
    const supabase = await getSupabaseClient()

    const { data: experience, error } = await supabase
      .from("experience")
      .update(data)
      .eq("id", experienceId)
      .eq("user_id", userId)
      .select()

    if (error) throw error
    return { success: true, data: experience?.[0] }
  } catch (error) {
    console.error("[v0] Experience update error:", error)
    return { success: false, error: "Failed to update experience" }
  }
}

export async function deleteExperience(userId: string, experienceId: string) {
  try {
    const supabase = await getSupabaseClient()

    const { error } = await supabase.from("experience").delete().eq("id", experienceId).eq("user_id", userId)

    if (error) throw error
    return { success: true }
  } catch (error) {
    console.error("[v0] Experience delete error:", error)
    return { success: false, error: "Failed to delete experience" }
  }
}

export async function getExperience(userId: string) {
  try {
    const supabase = await getSupabaseClient()

    const { data: experience, error } = await supabase
      .from("experience")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) throw error
    return { success: true, data: experience || [] }
  } catch (error) {
    console.error("[v0] Experience fetch error:", error)
    return { success: false, error: "Failed to fetch experience" }
  }
}

// PROJECTS OPERATIONS
export async function createProject(
  userId: string,
  data: {
    title: string
    description: string
    technologies: string[]
    image_url?: string
  },
) {
  try {
    const supabase = await getSupabaseClient()

    const { data: project, error } = await supabase
      .from("projects")
      .insert([{ user_id: userId, ...data }])
      .select()

    if (error) throw error
    return { success: true, data: project?.[0] }
  } catch (error) {
    console.error("[v0] Project create error:", error)
    return { success: false, error: "Failed to create project" }
  }
}

export async function updateProject(
  userId: string,
  projectId: string,
  data: {
    title?: string
    description?: string
    technologies?: string[]
    image_url?: string
  },
) {
  try {
    const supabase = await getSupabaseClient()

    const { data: project, error } = await supabase
      .from("projects")
      .update(data)
      .eq("id", projectId)
      .eq("user_id", userId)
      .select()

    if (error) throw error
    return { success: true, data: project?.[0] }
  } catch (error) {
    console.error("[v0] Project update error:", error)
    return { success: false, error: "Failed to update project" }
  }
}

export async function deleteProject(userId: string, projectId: string) {
  try {
    const supabase = await getSupabaseClient()

    const { error } = await supabase.from("projects").delete().eq("id", projectId).eq("user_id", userId)

    if (error) throw error
    return { success: true }
  } catch (error) {
    console.error("[v0] Project delete error:", error)
    return { success: false, error: "Failed to delete project" }
  }
}

export async function getProjects(userId: string) {
  try {
    const supabase = await getSupabaseClient()

    const { data: projects, error } = await supabase
      .from("projects")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) throw error
    return { success: true, data: projects || [] }
  } catch (error) {
    console.error("[v0] Projects fetch error:", error)
    return { success: false, error: "Failed to fetch projects" }
  }
}

// SKILLS OPERATIONS
export async function createSkillCategory(
  userId: string,
  data: {
    category: string
    skill_list: string[]
  },
) {
  try {
    const supabase = await getSupabaseClient()

    const { data: skill, error } = await supabase
      .from("skills")
      .insert([{ user_id: userId, ...data }])
      .select()

    if (error) throw error
    return { success: true, data: skill?.[0] }
  } catch (error) {
    console.error("[v0] Skill create error:", error)
    return { success: false, error: "Failed to create skill" }
  }
}

export async function updateSkillCategory(
  userId: string,
  skillId: string,
  data: {
    category?: string
    skill_list?: string[]
  },
) {
  try {
    const supabase = await getSupabaseClient()

    const { data: skill, error } = await supabase
      .from("skills")
      .update(data)
      .eq("id", skillId)
      .eq("user_id", userId)
      .select()

    if (error) throw error
    return { success: true, data: skill?.[0] }
  } catch (error) {
    console.error("[v0] Skill update error:", error)
    return { success: false, error: "Failed to update skill" }
  }
}

export async function deleteSkillCategory(userId: string, skillId: string) {
  try {
    const supabase = await getSupabaseClient()

    const { error } = await supabase.from("skills").delete().eq("id", skillId).eq("user_id", userId)

    if (error) throw error
    return { success: true }
  } catch (error) {
    console.error("[v0] Skill delete error:", error)
    return { success: false, error: "Failed to delete skill" }
  }
}

export async function getSkills(userId: string) {
  try {
    const supabase = await getSupabaseClient()

    const { data: skills, error } = await supabase
      .from("skills")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) throw error
    return { success: true, data: skills || [] }
  } catch (error) {
    console.error("[v0] Skills fetch error:", error)
    return { success: false, error: "Failed to fetch skills" }
  }
}
