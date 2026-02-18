"use client"

import Image from "next/image"
import Link from "next/link"
import { Github, Linkedin, Mail, ExternalLink, Download, ArrowDown, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AnimatedText, ClientMotion } from "@/components/client-animations"
import { useState, useEffect } from "react"

interface ProfileData {
  name?: string
  email?: string
  about_text?: string
  whatsapp?: string
  github_url?: string
  linkedin_url?: string
  twitter_url?: string
  profile_picture_url?: string
  resume_url?: string
}

interface HeroSectionProps {
  profile?: ProfileData | null
}

export function HeroSection({ profile }: HeroSectionProps) {
  const displayName = profile?.name || "Brian Muthui"
  const displayAbout =
    profile?.about_text ||
    "Specializing in CAD design, FEA simulation, and engineering optimization with expertise in deploying digital solutions and advancing sustainable mechanical systems."
  const linkedinUrl = profile?.linkedin_url || "https://linkedin.com/in/brian-muthui"
  const githubUrl = profile?.github_url || "https://github.com/brian-muthui"
  const emailAddress = profile?.email || "brian.muthui@email.com"
  const whatsappNumber = profile?.whatsapp || "254701234567"
  const profilePicture = profile?.profile_picture_url || "/images/profile.png"
  const resumeUrl = profile?.resume_url || "/documents/brian-muthui-resume.pdf"

  const profileImages = [
    profilePicture,
    "/thermal-system-design.jpg",
    "/robotic-arm-industrial.jpg",
    "/3d-printing-additive-manufacturing.jpg",
  ]

  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % profileImages.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [profileImages.length])

  return (
    <section className="relative pt-24 md:pt-28 lg:pt-36 pb-16 md:pb-20 lg:pb-28 px-4 overflow-hidden">
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-10 lg:gap-16">
          <div className="w-full md:w-1/2 space-y-4 md:space-y-6">
            <div>
              <AnimatedText text={displayName} className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight" />
              <AnimatedText
                text="Mechanical Engineer"
                className="text-xl sm:text-2xl md:text-3xl font-semibold mt-2 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent"
                once={true}
              />
            </div>
            <ClientMotion
              className="text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-300 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              {displayAbout}
            </ClientMotion>
            <ClientMotion
              className="flex flex-wrap gap-2 sm:gap-3 md:gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
            >
              <Button asChild className="text-xs sm:text-sm relative overflow-hidden group">
                <Link href="#contact">
                  <span className="relative z-10">Get in Touch</span>
                  <span className="absolute inset-0 bg-white dark:bg-gray-800 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></span>
                </Link>
              </Button>
              <Button
                variant="outline"
                asChild
                className="text-xs sm:text-sm relative overflow-hidden group bg-transparent"
              >
                <Link href="#projects">
                  <span className="relative z-10">View Projects</span>
                  <span className="absolute inset-0 bg-blue-600 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></span>
                </Link>
              </Button>
              <Button variant="secondary" asChild className="text-xs sm:text-sm relative overflow-hidden group">
                <Link href={resumeUrl} target="_blank" download>
                  <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  <span className="relative z-10">Resume</span>
                  <span className="absolute inset-0 bg-blue-600 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></span>
                </Link>
              </Button>
            </ClientMotion>
            <ClientMotion
              className="flex gap-3 sm:gap-4 pt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.8 }}
            >
              <Link
                href={linkedinUrl}
                target="_blank"
                className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors transform hover:scale-110 duration-300"
              >
                <Linkedin className="w-5 h-5 sm:w-6 sm:h-6" />
              </Link>
              <Link
                href={githubUrl}
                target="_blank"
                className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors transform hover:scale-110 duration-300"
              >
                <Github className="w-5 h-5 sm:w-6 sm:h-6" />
              </Link>
              <Link
                href={`mailto:${emailAddress}`}
                className="text-gray-600 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 transition-colors transform hover:scale-110 duration-300"
              >
                <Mail className="w-5 h-5 sm:w-6 sm:h-6" />
              </Link>
              <Link
                href={`https://wa.me/${whatsappNumber.replace(/\D/g, "")}`}
                target="_blank"
                className="text-gray-600 hover:text-green-500 dark:text-gray-400 dark:hover:text-green-400 transition-colors transform hover:scale-110 duration-300"
              >
                <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
              </Link>
            </ClientMotion>
          </div>
          <ClientMotion
            className="w-full md:w-1/2 flex justify-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              delay: 0.3,
              duration: 0.8,
              type: "spring",
              stiffness: 100,
            }}
          >
            <div className="relative w-56 h-56 sm:w-64 sm:h-64 md:w-72 md:h-72 lg:w-80 lg:h-80 rounded-full overflow-hidden border-4 border-white dark:border-gray-800 shadow-xl">
              <div className="relative w-full h-full overflow-hidden">
                {profileImages.map((image, index) => (
                  <ClientMotion
                    key={index}
                    className="absolute inset-0"
                    initial={{ opacity: 0, x: 100 }}
                    animate={{
                      opacity: index === currentImageIndex ? 1 : 0,
                      x: index === currentImageIndex ? 0 : 100,
                    }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                  >
                    <Image
                      src={image || "/placeholder.svg"}
                      alt={`Brian Muthui ${index + 1}`}
                      fill
                      className="object-cover"
                      priority={index === 0}
                    />
                  </ClientMotion>
                ))}
              </div>
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 to-cyan-600/20 mix-blend-overlay" />
              <div className="absolute bottom-3 sm:bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
                {profileImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === currentImageIndex ? "bg-white w-5 sm:w-6" : "bg-white/50 hover:bg-white/75"
                    }`}
                    aria-label={`View image ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </ClientMotion>
        </div>

        <ClientMotion
          className="absolute bottom-6 sm:bottom-8 left-1/2 transform -translate-x-1/2 hidden md:block"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 1, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
        >
          <Link href="#about" className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            <ArrowDown className="w-5 h-5 sm:w-6 sm:h-6" />
          </Link>
        </ClientMotion>
      </div>
    </section>
  )
}
