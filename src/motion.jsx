import { useEffect, useRef, useState } from 'react'
import {
  animate,
  motion,
  useAnimationFrame,
  useInView,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
  wrap,
} from 'framer-motion'

export const EASE = [0.22, 1, 0.36, 1]

// Har bir so'z pastdan maska ichidan chiqadi
export function SplitWords({ text, delay = 0, stagger = 0.06, play = true, className }) {
  return (
    <span className={className} aria-label={text}>
      {text.split(' ').map((word, i) => (
        <span className="mask" key={i} aria-hidden>
          <motion.span
            className="mask-inner"
            initial={{ y: '115%', rotate: 6 }}
            animate={play ? { y: '0%', rotate: 0 } : undefined}
            transition={{ duration: 1.1, ease: EASE, delay: delay + i * stagger }}
          >
            {word}
          </motion.span>
          {' '}
        </span>
      ))}
    </span>
  )
}

// Scroll'da so'zma-so'z yorishadigan matn
export function ScrollText({ text, className }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.85', 'end 0.45'] })
  const words = text.split(' ')
  return (
    <p ref={ref} className={className}>
      {words.map((w, i) => (
        <Word key={i} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]}>
          {w}
        </Word>
      ))}
    </p>
  )
}

function Word({ children, progress, range }) {
  const opacity = useTransform(progress, range, [0.14, 1])
  const y = useTransform(progress, range, [6, 0])
  return (
    <motion.span style={{ opacity, y, display: 'inline-block' }}>
      {children}&nbsp;
    </motion.span>
  )
}

export function Reveal({ children, delay = 0, y = 40, className, as = 'div' }) {
  const Tag = motion[as]
  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y, filter: 'blur(8px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, margin: '-10% 0px' }}
      transition={{ duration: 1, ease: EASE, delay }}
    >
      {children}
    </Tag>
  )
}

const fmt = (n) => Math.round(n).toLocaleString('en-US').replace(/,/g, ' ')

export function Counter({ value, suffix = '', prefix = '', duration = 2.2 }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-10% 0px' })
  const [display, setDisplay] = useState(fmt(0))
  useEffect(() => {
    if (!inView) return
    const controls = animate(0, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setDisplay(fmt(v)),
    })
    return () => controls.stop()
  }, [inView, value, duration])
  return (
    <span ref={ref}>
      {prefix}
      {display}
      {suffix}
    </span>
  )
}

// Kursorga tortiladigan element
export function Magnetic({ children, strength = 0.35 }) {
  const ref = useRef(null)
  const x = useSpring(0, { stiffness: 200, damping: 15, mass: 0.4 })
  const y = useSpring(0, { stiffness: 200, damping: 15, mass: 0.4 })
  const onMove = (e) => {
    const r = ref.current.getBoundingClientRect()
    x.set((e.clientX - (r.left + r.width / 2)) * strength)
    y.set((e.clientY - (r.top + r.height / 2)) * strength)
  }
  const reset = () => {
    x.set(0)
    y.set(0)
  }
  return (
    <motion.div ref={ref} onMouseMove={onMove} onMouseLeave={reset} style={{ x, y, display: 'inline-block' }}>
      {children}
    </motion.div>
  )
}

// Scroll tezligiga javob beradigan cheksiz marquee
export function VelocityMarquee({ items, baseVelocity = -2 }) {
  const baseX = useMotionValue(0)
  const { scrollY } = useScroll()
  const velocity = useVelocity(scrollY)
  const smooth = useSpring(velocity, { damping: 50, stiffness: 400 })
  const factor = useTransform(smooth, [0, 1000], [0, 5], { clamp: false })
  const skew = useTransform(smooth, [-2000, 2000], [8, -8])
  const x = useTransform(baseX, (v) => `${wrap(-25, -50, v)}%`)
  const dir = useRef(1)

  useAnimationFrame((_, delta) => {
    let move = dir.current * baseVelocity * (delta / 1000)
    const f = factor.get()
    if (f < 0) dir.current = -1
    else if (f > 0) dir.current = 1
    move += dir.current * move * f
    baseX.set(baseX.get() + move)
  })

  const row = [...items, ...items]
  return (
    <div className="marquee">
      <motion.div className="marquee-track" style={{ x, skewX: skew }}>
        {[0, 1, 2, 3].map((k) => (
          <span key={k} className="marquee-group">
            {row.map((t, i) => (
              <span key={i} className="marquee-item">
                {t}
                <span className="marquee-star">✦</span>
              </span>
            ))}
          </span>
        ))}
      </motion.div>
    </div>
  )
}

// Kursor ortidan ergashadigan yorug'lik (spotlight) kartasi
export function SpotlightCard({ children, className = '' }) {
  const ref = useRef(null)
  const onMove = (e) => {
    const r = ref.current.getBoundingClientRect()
    ref.current.style.setProperty('--x', `${e.clientX - r.left}px`)
    ref.current.style.setProperty('--y', `${e.clientY - r.top}px`)
  }
  return (
    <div ref={ref} onMouseMove={onMove} className={`spotlight ${className}`}>
      {children}
    </div>
  )
}
