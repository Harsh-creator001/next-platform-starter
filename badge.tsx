"use client"

import { useEffect, useRef } from "react"

interface Circle {
  x: number
  y: number
  radius: number
  vx: number
  vy: number
  color: string
}

export function AnimatedGradientBackground() {
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

      // Create gradient circles
      const circles: Circle[] = []
      for (let i = 0; i < 3; i++) {
        circles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: Math.random() * 150 + 80,
          vx: Math.random() * 0.1 - 0.05,
          vy: Math.random() * 0.1 - 0.05,
          color: i % 2 === 0 ? "rgba(59, 130, 246, 0.05)" : "rgba(6, 182, 212, 0.05)",
        })
      }

      const animate = () => {
        ctx.clearRect(0, 0, width, height)

        circles.forEach((circle) => {
          circle.x += circle.vx
          circle.y += circle.vy

          if (circle.x - circle.radius < 0 || circle.x + circle.radius > width) {
            circle.vx *= -1
          }
          if (circle.y - circle.radius < 0 || circle.y + circle.radius > height) {
            circle.vy *= -1
          }

          const gradient = ctx.createRadialGradient(circle.x, circle.y, 0, circle.x, circle.y, circle.radius)
          gradient.addColorStop(0, circle.color)
          gradient.addColorStop(1, "rgba(0, 0, 0, 0)")

          ctx.beginPath()
          ctx.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2)
          ctx.fillStyle = gradient
          ctx.fill()
        })

        animationFrameId = requestAnimationFrame(animate)
      }

      animate()

      return () => {
        window.removeEventListener("resize", resizeCanvas)
        cancelAnimationFrame(animationFrameId)
      }
    } catch (error) {
      console.error("[v0] AnimatedGradientBackground error:", error)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full -z-10 opacity-60 dark:opacity-30"
      style={{ pointerEvents: "none" }}
    />
  )
}
