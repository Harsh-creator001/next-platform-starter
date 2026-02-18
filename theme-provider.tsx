"use client"

import { useRef, useEffect, useState } from "react"
import { motion, useAnimation, useInView } from "framer-motion"

interface SkillProgressProps {
  name: string
  percentage: number
  color?: string
}

export function SkillProgress({ name, percentage, color = "bg-purple-600" }: SkillProgressProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })
  const controls = useAnimation()
  const [hasAnimated, setHasAnimated] = useState(false)

  useEffect(() => {
    if (isInView && !hasAnimated) {
      controls.start({
        width: `${percentage}%`,
        transition: {
          duration: 1.2,
          ease: [0.25, 0.1, 0.25, 1],
        },
      })
      setHasAnimated(true)
    }
  }, [isInView, controls, percentage, hasAnimated])

  return (
    <div ref={ref} className="mb-4">
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium">{name}</span>
        <span className="text-sm font-medium">{percentage}%</span>
      </div>
      <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <motion.div className={`h-full rounded-full ${color}`} initial={{ width: "0%" }} animate={controls} />
      </div>
    </div>
  )
}

export default SkillProgress
