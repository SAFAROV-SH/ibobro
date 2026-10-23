import { useCallback, useEffect, useRef, useState } from 'react'
import {
  AnimatePresence,
  MotionConfig,
  animate,
  motion,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion'
import Lenis from 'lenis'
import 'lenis/dist/lenis.css'
import {
  ABOUT,
  ADVANTAGE,
  COMPETENCIES,
  GOAL,
  HERO,
  LINKS,
  MARQUEE,
  NAME,
  RESULTS,
  STATS,
  TIMELINE,
} from './data'
import {
  Counter,
  EASE,
  Magnetic,
  Reveal,
  ScrollText,
  SplitWords,
  SpotlightCard,
  VelocityMarquee,
} from './motion'

let lenis = null
const reduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

const scrollTo = (id) => (e) => {
  e.preventDefault()
  const el = document.querySelector(id)
  if (!el) return
  if (lenis) lenis.scrollTo(el, { offset: -20, duration: 1.6 })
  else el.scrollIntoView({ behavior: 'smooth' })
}

const NAV = [
  ['#about', 'Asoschi haqida'],
  ['#journey', 'Rivojlanish bosqichi'],
  ['#results', 'Natijalar'],
  ['#skills', 'Kompetensiyalar'],
]

export default function App() {
  const [loaded, setLoaded] = useState(false)
  const finish = useCallback(() => setLoaded(true), [])

  useEffect(() => {
    if (reduced) return
    lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 1 })
    let raf
    const loop = (t) => {
      lenis.raf(t)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(raf)
      lenis.destroy()
      lenis = null
    }
  }, [])

  useEffect(() => {
    document.documentElement.style.overflow = loaded ? '' : 'hidden'
    if (lenis) loaded ? lenis.start() : lenis.stop()
  }, [loaded])

  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence>{!loaded && <Preloader onDone={finish} />}</AnimatePresence>
      <Cursor />
      <div className="grain" aria-hidden />
      <Nav ready={loaded} />
      <main>
        <Hero ready={loaded} />
        <VelocityMarquee items={MARQUEE} baseVelocity={-1} />
        <About />
        <Journey />
        <Results />
        <Skills />
        <Advantage />
      </main>
      <Footer />
    </MotionConfig>
  )
}

/* ---------------- Preloader ---------------- */
function Preloader({ onDone }) {
  const [n, setN] = useState(0)
  useEffect(() => {
    const c = animate(0, 100, {
      duration: reduced ? 0.2 : 2,
      ease: [0.65, 0, 0.35, 1],
      onUpdate: (v) => setN(Math.round(v)),
      onComplete: () => setTimeout(onDone, 250),
    })
    return () => c.stop()
  }, [onDone])
  return (
    <motion.div
      className="loader"
      exit={{ clipPath: 'inset(0 0 100% 0)' }}
      initial={{ clipPath: 'inset(0 0 0% 0)' }}
      transition={{ duration: 1, ease: [0.76, 0, 0.24, 1] }}
    >
      <div className="loader-inner">
        <motion.div
          className="loader-brand"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE }}
        >
          Founder Profile <span>— 2026</span>
        </motion.div>
        <div className="loader-count">{String(n).padStart(3, '0')}</div>
      </div>
      <div className="loader-bar">
        <span style={{ transform: `scaleX(${n / 100})` }} />
      </div>
    </motion.div>
  )
}

/* ---------------- Cursor ---------------- */
function Cursor() {
  const x = useMotionValue(-100)
  const y = useMotionValue(-100)
  const rx = useSpring(x, { stiffness: 180, damping: 20, mass: 0.5 })
  const ry = useSpring(y, { stiffness: 180, damping: 20, mass: 0.5 })
  const [hover, setHover] = useState(false)
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine)').matches
    setEnabled(fine)
    if (!fine) return
    const move = (e) => {
      x.set(e.clientX)
      y.set(e.clientY)
      setHover(!!e.target.closest('a, button, .spotlight'))
    }
    window.addEventListener('mousemove', move)
    return () => window.removeEventListener('mousemove', move)
  }, [x, y])

  if (!enabled) return null
  return (
    <>
      <motion.div className="cursor-dot" style={{ x, y }} />
      <motion.div
        className="cursor-ring"
        style={{ x: rx, y: ry }}
        animate={{ scale: hover ? 2.2 : 1, opacity: hover ? 0.9 : 0.5 }}
        transition={{ duration: 0.35, ease: EASE }}
      />
    </>
  )
}

/* ---------------- Nav ---------------- */
function Nav({ ready }) {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30 })
  return (
    <motion.header
      className="nav"
      initial={{ y: -80, opacity: 0 }}
      animate={ready ? { y: 0, opacity: 1 } : undefined}
      transition={{ duration: 1, ease: EASE, delay: 0.6 }}
    >
      <div className="nav-inner">
        <a href="#top" onClick={scrollTo('#top')} className="nav-logo">
          <img className="nav-logo-mark" src="/ava.jpg" alt="" />
          <span>{NAME}</span>
        </a>
        <nav className="nav-links">
          {NAV.map(([href, label]) => (
            <a key={href} href={href} onClick={scrollTo(href)}>
              <span className="roll">
                <span data-text={label}>{label}</span>
              </span>
            </a>
          ))}
        </nav>
        <Magnetic>
          <a className="nav-cta" href={LINKS.connectYoutube} target="_blank" rel="noreferrer">
            Connect Mobile ↗
          </a>
        </Magnetic>
      </div>
      <motion.div className="nav-progress" style={{ scaleX }} />
    </motion.header>
  )
}

/* ---------------- Hero ---------------- */
function Hero({ ready }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const imgY = useTransform(scrollYProgress, [0, 1], ['0%', '18%'])
  const textY = useTransform(scrollYProgress, [0, 1], ['0%', '-30%'])
  const fade = useTransform(scrollYProgress, [0, 0.7], [1, 0])

  // sichqoncha bilan 3D egilish
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const rotX = useSpring(useTransform(my, [-0.5, 0.5], [7, -7]), { stiffness: 120, damping: 18 })
  const rotY = useSpring(useTransform(mx, [-0.5, 0.5], [-9, 9]), { stiffness: 120, damping: 18 })
  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect()
    mx.set((e.clientX - r.left) / r.width - 0.5)
    my.set((e.clientY - r.top) / r.height - 0.5)
  }
  const onLeave = () => {
    mx.set(0)
    my.set(0)
  }

  return (
    <section id="top" className="hero" ref={ref}>
      <div className="hero-glow" aria-hidden />
      <div className="hero-grid" aria-hidden />
      <motion.div className="hero-text" style={{ y: textY, opacity: fade }}>
        <motion.div
          className="eyebrow"
          initial={{ opacity: 0, x: -20 }}
          animate={ready ? { opacity: 1, x: 0 } : undefined}
          transition={{ duration: 0.9, ease: EASE, delay: 0.2 }}
        >
          <span className="pulse" /> Founder Profile — 2026
        </motion.div>
        <h1 className="hero-title">
          <SplitWords text={HERO.role} play={ready} delay={0.25} />
          <br />
          <SplitWords text={HERO.company} play={ready} delay={0.45} className="grad" />
        </h1>
        <motion.p
          className="hero-lead"
          initial={{ opacity: 0, y: 24 }}
          animate={ready ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 1, ease: EASE, delay: 0.9 }}
        >
          {HERO.lead}
        </motion.p>
        <motion.div
          className="hero-actions"
          initial={{ opacity: 0, y: 24 }}
          animate={ready ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 1, ease: EASE, delay: 1.05 }}
        >
          <Magnetic>
            <a href="#journey" onClick={scrollTo('#journey')} className="btn btn-primary">
              Faoliyatim <span className="btn-arrow">↓</span>
            </a>
          </Magnetic>
          <Magnetic>
            <a href="#results" onClick={scrollTo('#results')} className="btn btn-ghost">
              Natijalar
            </a>
          </Magnetic>
        </motion.div>
      </motion.div>

      <div className="hero-visual" onMouseMove={onMove} onMouseLeave={onLeave}>
        <motion.div className="photo-tilt" style={{ rotateX: rotX, rotateY: rotY }}>
          <motion.div
            className="photo"
            initial={{ clipPath: 'inset(100% 0% 0% 0% round 28px)' }}
            animate={ready ? { clipPath: 'inset(0% 0% 0% 0% round 28px)' } : undefined}
            transition={{ duration: 1.5, ease: [0.76, 0, 0.24, 1], delay: 0.15 }}
          >
            <motion.img
              src="/me.jpg"
              alt={`${NAME} — Founder & CEO, Connect Mobile`}
              style={{ y: imgY }}
              initial={{ scale: 1.35 }}
              animate={ready ? { scale: 1.08 } : undefined}
              transition={{ duration: 2, ease: EASE, delay: 0.15 }}
            />
            <div className="photo-shade" />
          </motion.div>
          <FloatChip ready={ready} className="chip-a" delay={1.2} value={21000} suffix="+" label="YouTube obunachisi" />
          <FloatChip ready={ready} className="chip-b" delay={1.4} value={300} suffix="+" label="muvaffaqiyatli loyiha" />
          <FloatChip ready={ready} className="chip-c" delay={1.6} value={5} suffix=" yil+" label="amaliy tajriba" />
        </motion.div>
      </div>

      <motion.div
        className="scroll-hint"
        initial={{ opacity: 0 }}
        animate={ready ? { opacity: 1 } : undefined}
        transition={{ delay: 1.8, duration: 1 }}
        style={{ opacity: fade }}
      >
        <span>Scroll</span>
        <span className="scroll-line" />
      </motion.div>
    </section>
  )
}

function FloatChip({ ready, className, delay, value, suffix, label }) {
  return (
    <motion.div
      className={`chip ${className}`}
      initial={{ opacity: 0, scale: 0.6, y: 30 }}
      animate={ready ? { opacity: 1, scale: 1, y: 0 } : undefined}
      transition={{ type: 'spring', stiffness: 160, damping: 16, delay }}
    >
      <div className="chip-float">
        <strong>{ready ? <Counter value={value} suffix={suffix} duration={1.8} /> : '0'}</strong>
        <span>{label}</span>
      </div>
    </motion.div>
  )
}

/* ---------------- Section heading ---------------- */
function Heading({ index, kicker, title }) {
  return (
    <div className="heading">
      <Reveal className="kicker">
        <span className="kicker-num">{index}</span>
        <span className="kicker-line" />
        {kicker}
      </Reveal>
      <h2 className="h2">
        <InViewSplit text={title} />
      </h2>
    </div>
  )
}

function InViewSplit({ text }) {
  const [play, setPlay] = useState(false)
  return (
    <motion.span onViewportEnter={() => setPlay(true)} viewport={{ once: true, margin: '-15% 0px' }}>
      <SplitWords text={text} play={play} stagger={0.05} />
    </motion.span>
  )
}

/* ---------------- About ---------------- */
function About() {
  return (
    <section id="about" className="section">
      <Heading index="01" kicker="Asoschi haqida" title="Asoschi haqida" />
      <div className="about-text">
        {ABOUT.map((p, i) => (
          <ScrollText key={i} text={p} className={i === 0 ? 'about-lead' : 'about-p'} />
        ))}
      </div>
      <div className="stats">
        {STATS.map((s, i) => (
          <Reveal key={s.label} delay={i * 0.1} className="stat">
            <div className="stat-value">
              <Counter value={s.value} suffix={s.suffix} />
            </div>
            <div className="stat-label">{s.label}</div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

/* ---------------- Journey / Timeline ---------------- */
function Journey() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.7', 'end 0.6'] })
  const scaleY = useSpring(scrollYProgress, { stiffness: 90, damping: 25 })
  return (
    <section id="journey" className="section">
      <Heading index="02" kicker="Yo‘l" title="Faoliyatim va rivojlanish bosqichlari" />
      <div className="timeline" ref={ref}>
        <div className="timeline-rail">
          <motion.div className="timeline-fill" style={{ scaleY }} />
        </div>
        {TIMELINE.map((item, i) => (
          <TimelineItem key={item.title} item={item} index={i} />
        ))}
      </div>
    </section>
  )
}

function TimelineItem({ item, index }) {
  return (
    <motion.article
      className="tl-item"
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-20% 0px' }}
    >
      <motion.div
        className="tl-dot"
        variants={{ hidden: { scale: 0 }, show: { scale: 1 } }}
        transition={{ type: 'spring', stiffness: 260, damping: 18 }}
      >
        <span>{index + 1}</span>
      </motion.div>
      <motion.div
        className="tl-card"
        variants={{
          hidden: { opacity: 0, x: 60, filter: 'blur(10px)' },
          show: { opacity: 1, x: 0, filter: 'blur(0px)' },
        }}
        transition={{ duration: 1, ease: EASE, delay: 0.1 }}
      >
        <SpotlightCard className="tl-card-inner">
          <div className="tl-meta">
            <span className="tl-step">0{index + 1}</span>
            {item.period && <span className="tl-period">{item.period}</span>}
          </div>
          <h3 className="tl-title">{item.title}</h3>
          <div className="tl-body">
            {item.body.map((p, i) => (
              <motion.p
                key={i}
                variants={{ hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } }}
                transition={{ duration: 0.8, ease: EASE, delay: 0.25 + i * 0.08 }}
              >
                {p}
              </motion.p>
            ))}
          </div>
          {item.result && (
            <div className="tl-result">
              <span>Natija</span>
              {item.result}
            </div>
          )}
          {item.cta && (
            <div className="tl-cta">
              <Magnetic>
                <a href={item.cta.href} target="_blank" rel="noreferrer" className="btn btn-primary">
                  {item.cta.label} <span className="btn-arrow">↓</span>
                </a>
              </Magnetic>
            </div>
          )}
          {item.links && (
            <div className="tl-links">
              {item.linksTitle && <span className="tl-links-title">{item.linksTitle}:</span>}
              {item.links.map((l) => (
                <a key={l.href} href={l.href} target="_blank" rel="noreferrer" className="link-pill">
                  {l.label}
                  <span className="link-arrow">↗</span>
                </a>
              ))}
            </div>
          )}
        </SpotlightCard>
      </motion.div>
    </motion.article>
  )
}

/* ---------------- Results ---------------- */
function Results() {
  return (
    <section id="results" className="section">
      <Heading index="03" kicker="2026-yil oktabr holatiga ko‘ra" title="Connect Mobile dastlabki 2 oy natijalar" />
      <div className="results">
        {RESULTS.map((r, i) => (
          <Reveal key={r.label} delay={i * 0.12} className="result-wrap">
            <SpotlightCard className="result">
              <div className="result-value">
                <Counter value={r.value} suffix={r.suffix} duration={2.6} />
              </div>
              <div className="result-label">{r.label}</div>
              <div className="result-glow" aria-hidden />
            </SpotlightCard>
          </Reveal>
        ))}
      </div>
      <Reveal className="results-note">
        Ushbu natijalar loyiha dastlabki bosqichdayoq real mijozlar va savdo jarayonlariga ega ekanini ko‘rsatadi.
      </Reveal>
    </section>
  )
}

/* ---------------- Skills ---------------- */
function Skills() {
  return (
    <section id="skills" className="section">
      <Heading index="04" kicker="Kompetensiyalar" title="Asosiy kompetensiyalarim" />
      <div className="skills">
        {COMPETENCIES.map((c, i) => (
          <Reveal key={c.title} delay={i * 0.1} className="skill-wrap">
            <SpotlightCard className="skill">
              <span className="skill-num">0{i + 1}</span>
              <h3>{c.title}</h3>
              <p>{c.text}</p>
            </SpotlightCard>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

/* ---------------- Advantage + Goal ---------------- */
function Advantage() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const scale = useTransform(scrollYProgress, [0, 0.45], [0.88, 1])
  const rotate = useTransform(scrollYProgress, [0, 0.45], [-3, 0])
  return (
    <section className="section">
      <Heading index="05" kicker="Ustunlik" title="Founder sifatidagi ustunlik" />
      <div className="about-text">
        {ADVANTAGE.map((p, i) => (
          <ScrollText key={i} text={p} className={i === 1 ? 'about-lead' : 'about-p'} />
        ))}
      </div>
      <motion.div ref={ref} className="goal" style={{ scale, rotate }}>
        <div className="goal-orb" aria-hidden />
        <span className="goal-kicker">Strategik maqsad</span>
        <ScrollText text={GOAL} className="goal-text" />
      </motion.div>
    </section>
  )
}

/* ---------------- Footer ---------------- */
function Footer() {
  const all = [
    ['Portfolio', 't.me/G_What', LINKS.portfolio],
    ['YouTube', 'GAME FANAT', LINKS.gameFanat],
    ['YouTube', 'Connect Mobile', LINKS.connectYoutube],
    ['Telegram', 't.me/Connect_iPad', LINKS.ipad],
    ['Telegram', 't.me/connect_aksesuars', LINKS.accessories],
  ]
  return (
    <footer className="footer">
      <div className="footer-links">
        {all.map(([k, label, href], i) => (
          <Reveal key={href} delay={i * 0.06}>
            <a href={href} target="_blank" rel="noreferrer" className="footer-link">
              <span className="footer-k">{k}</span>
              <span className="footer-label">{label}</span>
              <span className="footer-arrow">↗</span>
            </a>
          </Reveal>
        ))}
      </div>
      <div className="footer-big" aria-hidden>
        <InViewSplit text="Connect Mobile" />
      </div>
      <div className="footer-bottom">
        <span>{NAME} — Founder &amp; CEO | Connect Mobile</span>
        <span>Founder Profile — 2026</span>
      </div>
    </footer>
  )
}
