"use server"

import { createClient } from "@/lib/supabase/server"

export async function getPublicProfile() {
  const supabase = await createClient()

  if (!supabase) {
    return null
  }

  // Get the first profile (the portfolio owner)
  const { data, error } = await supabase
    .from("profiles")
    .select("name, email, about_text, whatsapp, github_url, linkedin_url, twitter_url, profile_picture_url, resume_url")
    .limit(1)

  if (error) {
    console.error("[v0] Error fetching public profile:", error)
    return null
  }

  // Return first profile or null if none exist yet
  return data && data.length > 0 ? data[0] : null
}

export async function getPublicExperience() {
  const supabase = await createClient()

  if (!supabase) {
    return []
  }

  const { data, error } = await supabase
    .from("experience")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching public experience:", error)
    return []
  }

  return data || []
}

export async function getPublicProjects() {
  const supabase = await createClient()

  if (!supabase) {
    return []
  }

  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching public projects:", error)
    return []
  }

  return data || []
}

export async function getPublicSkills() {
  const supabase = await createClient()

  if (!supabase) {
    return []
  }

  const { data, error } = await supabase
    .from("skills")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching public skills:", error)
    return []
  }

  return data || []
}
