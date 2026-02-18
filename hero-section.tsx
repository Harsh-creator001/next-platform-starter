"use client"

// Direct imports with proper client-side error handling
import { AnimatedText } from "@/components/animated-text"
import { AnimatedSection } from "@/components/animated-section"
import { AnimatedCard } from "@/components/animated-card"
import { ParticleBackground } from "@/components/particle-background"
import { AnimatedGradientBackground } from "@/components/ui/animated-gradient-background"
import { motion } from "framer-motion"

// Export the components directly
export { AnimatedText, AnimatedSection, AnimatedCard, ParticleBackground, AnimatedGradientBackground }

// Export motion.div as ClientMotion
export const ClientMotion = motion.div
