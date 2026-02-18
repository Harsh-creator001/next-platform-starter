"use client"

import { useEffect, useRef } from "react"

interface Particle {
  x: number
  y: number
  radius: number
  vx: number
  vy: number
  color: string
}

export function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    try {
      const ctx = canvas.getContext("2d")
      if (!ctx) return

      let width = window.innerWidth
      let height = window.innerHeight
      let animationFrameId: number

      const resizeCanvas = () => {
        width = window.innerWidth
        height = window.innerHeight
        canvas.width = width
        canvas.height = height
      }

      resizeCanvas()
      window.addEventListener("resize", resizeCanvas)

      // Create particles
      const particleCount = 50
      const particles: Particle[] = []

      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: Math.random() * 2 + 1,
          vx: Math.random() * 0.5 - 0.25,
          vy: Math.random() * 0.5 - 0.25,
          color: `rgba(${Math.floor(Math.random() * 100 + 155)}, ${Math.floor(
            Math.random() * 100 + 155,
          )}, ${Math.floor(Math.random() * 100 + 155)}, 0.7)`,
        })
      }

      // Draw particles and connections
      const draw = () => {
        ctx.clearRect(0, 0, width, height)

        // Update and draw particles
        particles.forEach((p) => {
          p.x += p.vx
          p.y += p.vy

          // Bounce off edges
          if (p.x < 0 || p.x > width) p.vx *= -1
          if (p.y < 0 || p.y > height) p.vy *= -1

          // Keep particles within bounds
          p.x = Math.max(0, Math.min(width, p.x))
          p.y = Math.max(0, Math.min(height, p.y))

          // Draw particle
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
          ctx.fillStyle = p.color
          ctx.fill()
        })

        // Draw connections
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const p1 = particles[i]
            const p2 = particles[j]
            const dx = p1.x - p2.x
            const dy = p1.y - p2.y
            const distance = Math.sqrt(dx * dx + dy * dy)

            if (distance < 100) {
              ctx.beginPath()
              ctx.strokeStyle = `rgba(150, 150, 150, ${0.2 * (1 - distance / 100)})`
              ctx.lineWidth = 0.5
              ctx.moveTo(p1.x, p1.y)
              ctx.lineTo(p2.x, p2.y)
              ctx.stroke()
            }
          }
        }

        animationFrameId = requestAnimationFrame(draw)
      }

      draw()

      return () => {
        window.removeEventListener("resize", resizeCanvas)
        cancelAnimationFrame(animationFrameId)
      }
    } catch (error) {
      console.error("[v0] ParticleBackground error:", error)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full -z-10 opacity-30 dark:opacity-20"
      style={{ pointerEvents: "none" }}
    />
  )
}
