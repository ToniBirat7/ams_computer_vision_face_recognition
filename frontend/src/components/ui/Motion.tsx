'use client'

import { motion, useInView, useMotionValue, useSpring } from 'framer-motion'
import { useEffect, useRef, type ReactNode } from 'react'

// ── Reveal: fade + rise on mount ─────────────────────────────────────────────
export function Reveal({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// ── Stagger: parent + children for list/grid reveals ─────────────────────────
export function Stagger({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: 0.06, delayChildren: delay } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function StaggerItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 18 },
        show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// ── CountUp: animated number ─────────────────────────────────────────────────
export function CountUp({ value, className, suffix = '' }: { value: number; className?: string; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const mv = useMotionValue(0)
  const spring = useSpring(mv, { duration: 1000, bounce: 0 })

  useEffect(() => {
    if (inView) mv.set(value)
  }, [inView, value, mv])

  useEffect(() => {
    return spring.on('change', (v) => {
      if (ref.current) ref.current.textContent = `${Math.round(v)}${suffix}`
    })
  }, [spring, suffix])

  return <span ref={ref} className={className}>0{suffix}</span>
}
