'use client'

import { useRef, useState, useCallback, useEffect } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────
type Screen = 's1' | 's2' | 's3' | 's4' | 's5'

type MemeItem =
  | { type: 'emoji'; value: string }
  | { type: 'image'; value: string; alt?: string }

interface Choice {
  emoji: string
  name:  string
  sub:   string
}

interface PlanData {
  menu:    Choice
  place:   Choice
  dateStr: string
  loc:     string
}

// ─── Constants ────────────────────────────────────────────────────────────────
const TARGET_EMAIL = 'punnawich.kanokpornwanich@gmail.com'

const REFUSES: string[] = [
  "That button keeps running away~ 😏",
  "Getting harder to catch, isn't it? 🤭",
  "Try again… if you can!",
  "It ran away again~ don't give up!",
  "The Date button is waiting for you 💕",
  "So fast! But you can't catch it 🌸",
]

const MEMES: MemeItem[] = [
  { type: 'image', value: '/image/cat_luv/cat1.jpg',  alt: 'cat1'  },
  { type: 'image', value: '/image/cat_luv/cat2.jpg',  alt: 'cat2'  },
  { type: 'image', value: '/image/cat_luv/cat3.jpg',  alt: 'cat3'  },
  { type: 'image', value: '/image/cat_luv/cat4.jpg',  alt: 'cat4'  },
  { type: 'image', value: '/image/cat_luv/cat5.jpg',  alt: 'cat5'  },
  { type: 'image', value: '/image/cat_luv/cat6.jpg',  alt: 'cat6'  },
  { type: 'image', value: '/image/cat_luv/cat7.jpg',  alt: 'cat7'  },
  { type: 'image', value: '/image/cat_luv/cat8.jpg',  alt: 'cat8'  },
  { type: 'image', value: '/image/cat_luv/cat9.jpg',  alt: 'cat9'  },
  { type: 'image', value: '/image/cat_luv/cat10.jpg', alt: 'cat10' },
  { type: 'image', value: '/image/cat_luv/cat11.jpg', alt: 'cat11' },
  { type: 'image', value: '/image/cat_luv/cat12.jpg', alt: 'cat12' },
  { type: 'image', value: '/image/cat_luv/cat13.jpg', alt: 'cat13' },
]

const MENU_ITEMS: Choice[] = [
  { emoji: '🍣', name: 'Sushi & Omakase',  sub: 'Japanese, romantic & refined'  },
  { emoji: '🍝', name: 'Pasta & Steak',    sub: 'Italian, candlelit ambiance'    },
  { emoji: '🍜', name: 'Ramen & Izakaya',  sub: 'Cosy, laid-back & fun'          },
  { emoji: '🥩', name: 'BBQ & Grill',      sub: 'Warm vibes, grill together'     },
  { emoji: '🧁', name: 'Café & Desserts',  sub: 'Sweet just like you 🍰'         },
  { emoji: '🌮', name: 'Mexican & Tacos',  sub: 'Vibrant, fun & colourful'       },
]

const PLACE_ITEMS: Choice[] = [
  { emoji: '🌅', name: 'Riverside / Sunset View',    sub: 'Romantic, perfect for couple photos' },
  { emoji: '🏙️', name: 'Rooftop / City View',        sub: 'City lights & night sky'             },
  { emoji: '🌳', name: 'Park / Nature',               sub: 'Stroll together, fresh air'          },
  { emoji: '🎡', name: 'Amusement Park / Exhibition', sub: 'Fun, exciting & memorable'           },
  { emoji: '🎬', name: 'Cinema / Show',               sub: 'Sit close, cosy together'            },
  { emoji: '🛍️', name: 'Shopping / Night Market',    sub: 'Chill walk & good chat'              },
]

const TIME_GROUPS: { label: string; slots: string[] }[] = [
  { label: 'Morning',   slots: ['09:00','10:00','11:00'] },
  { label: 'Noon',      slots: ['12:00','13:00']          },
  { label: 'Afternoon', slots: ['14:00','15:00','16:00'] },
  { label: 'Evening',   slots: ['17:00','18:00','19:00'] },
  { label: 'Night',     slots: ['20:00','21:00','22:00'] },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────
function randomMeme(current: MemeItem): MemeItem {
  const pool = MEMES.filter(m => m.value !== current.value)
  return pool[Math.floor(Math.random() * pool.length)]
}

function fmtDate(d: string, t: string): string {
  if (!d) return ''
  return new Date(`${d}T${t}:00`).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  }) + ' at ' + t
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function HeroDisplay({ meme }: { meme: MemeItem }) {
  if (meme.type === 'image') {
    return (
      <img
        src={meme.value}
        alt={meme.alt ?? 'meme'}
        className="hero-emoji"
        style={{
          width: 'var(--hero)',
          height: 'var(--hero)',
          objectFit: 'cover',
          borderRadius: '50%',
        }}
      />
    )
  }
  return <div className="hero-emoji">{meme.value}</div>
}

function Steps({ current }: { current: number }) {
  return (
    <div className="steps">
      {[1, 2, 3, 4].map(n => (
        <div
          key={n}
          className={`step-dot${n === current ? ' active' : n < current ? ' done' : ''}`}
        />
      ))}
    </div>
  )
}

function SectionBadge({ emoji, title }: { emoji: string; title: string }) {
  return (
    <div className="section-badge">
      <span className="section-emoji">{emoji}</span>
      <span className="section-title">{title}</span>
    </div>
  )
}

function PlanRow({
  icon, label, value, sub,
}: {
  icon: string; label: string; value: string; sub?: string
}) {
  return (
    <div className="plan-row">
      <div className="plan-icon">{icon}</div>
      <div>
        <div className="plan-label">{label}</div>
        <div className="plan-value">{value}</div>
        {sub && <div className="plan-sub">{sub}</div>}
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function DateInvitePage() {
  const [screen,      setScreen]      = useState<Screen>('s1')
  const [heroMeme,    setHeroMeme]    = useState<MemeItem>(MEMES[0])
  const [refuseMsg,   setRefuseMsg]   = useState<string>('')
  const [menuChoice,  setMenuChoice]  = useState<Choice | null>(null)
  const [placeChoice, setPlaceChoice] = useState<Choice | null>(null)
  const [selTime,     setSelTime]     = useState<string>('')
  const [ddOpen,      setDdOpen]      = useState<boolean>(false)
  const [dateVal,     setDateVal]     = useState<string>('')
  const [locVal,      setLocVal]      = useState<string>('')
  const [plan,        setPlan]        = useState<PlanData | null>(null)
  const [emailState,  setEmailState]  = useState<'idle' | 'sending' | 'ok'>('idle')
  const [mailtoLink,  setMailtoLink]  = useState<string>('')
  const [btnPos,      setBtnPos]      = useState<{ x: number; y: number } | null>(null)

  const s1Ref     = useRef<HTMLDivElement>(null)
  const btnNotRef = useRef<HTMLButtonElement>(null)
  const refuseIdx = useRef<number>(0)

  // ── Navigation ──────────────────────────────────────────────────────────────
  const go = useCallback((s: Screen) => {
    setScreen(s)
    setDdOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  // ── Run-away logic ──────────────────────────────────────────────────────────
  const runAway = useCallback(() => {
    const container = s1Ref.current
    const btn       = btnNotRef.current
    if (!container || !btn) return

    const cW  = container.offsetWidth
    const cH  = container.offsetHeight
    const bW  = btn.offsetWidth  || 100
    const bH  = btn.offsetHeight || 44
    const pad = 16

    const maxX = cW - bW - pad
    const maxY = cH - bH - pad
    const curX = btnPos?.x ?? 0
    const curY = btnPos?.y ?? 0

    let x = 0, y = 0, tries = 0
    do {
      x = pad + Math.random() * Math.max(0, maxX - pad)
      y = pad + Math.random() * Math.max(0, maxY - pad)
      tries++
    } while (tries < 30 && Math.abs(x - curX) < 80 && Math.abs(y - curY) < 50)

    x = Math.max(pad, Math.min(x, maxX))
    y = Math.max(pad, Math.min(y, maxY))
    setBtnPos({ x, y })

    setRefuseMsg(REFUSES[refuseIdx.current % REFUSES.length])
    refuseIdx.current++

    // Hero meme pop animation via CSS transform
    setHeroMeme(prev => randomMeme(prev))
  }, [btnPos])

  // ── Reset ───────────────────────────────────────────────────────────────────
  const restart = useCallback(() => {
    setBtnPos(null)
    setRefuseMsg('')
    setHeroMeme(MEMES[0])
    setMenuChoice(null)
    setPlaceChoice(null)
    setSelTime('')
    setDateVal('')
    setLocVal('')
    setPlan(null)
    setEmailState('idle')
    setMailtoLink('')
    refuseIdx.current = 0
    go('s1')
  }, [go])

  // ── Form validation ─────────────────────────────────────────────────────────
  const form4Ready = !!(dateVal && selTime && locVal.trim())

  // ── Go to result ────────────────────────────────────────────────────────────
  const goResult = useCallback(() => {
    const m = menuChoice  ?? { emoji: '🍽️', name: 'Dinner',    sub: '' }
    const p = placeChoice ?? { emoji: '📍',  name: 'Somewhere', sub: '' }
    setPlan({ menu: m, place: p, dateStr: fmtDate(dateVal, selTime), loc: locVal.trim() })
    setEmailState('idle')
    go('s5')
  }, [menuChoice, placeChoice, dateVal, selTime, locVal, go])

  // ── Send email ──────────────────────────────────────────────────────────────
  const sendEmail = useCallback(() => {
    if (!plan) return
    setEmailState('sending')

    const { menu, place, dateStr, loc } = plan
    const body = [
      '💌 A Special Date Invitation 💌',
      '',
      'Hey there 🌸',
      '',
      "I'd love to take you out on a date — here's the plan!",
      '',
      `🍽️  Dinner: ${menu.emoji} ${menu.name}`,
      `     ${menu.sub}`,
      '',
      `🗺️  After dinner: ${place.emoji} ${place.name}`,
      `     ${place.sub}`,
      '',
      `📅  When: ${dateStr}`,
      '',
      `📍  Meeting spot: ${loc}`,
      '',
      "Can't wait to see you! 💕",
      '— Sent with love 🌹',
    ].join('\n')

    const subj   = '💌 A Special Date Invitation Just for You 🌸'
    const mailto = `mailto:${TARGET_EMAIL}?subject=${encodeURIComponent(subj)}&body=${encodeURIComponent(body)}`
    setMailtoLink(mailto)

    setTimeout(() => setEmailState('ok'), 800)
  }, [plan])

  // ── Close dropdown on outside click ────────────────────────────────────────
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('#time-dd')) setDdOpen(false)
    }
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [])

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="app">

      {/* Background */}
      <div className="bg-layer" />
      <div className="petals">
        {['🌸', '🌷', '✨', '💮', '🌸', '🌷', '💕', '✨'].map((p, i) => (
          <div key={i} className="petal">{p}</div>
        ))}
      </div>

      {/* ── S1: Intro ─────────────────────────────────────────────────────── */}
      <div
        ref={s1Ref}
        id="s1"
        className={`screen screen-s1${screen === 's1' ? ' active' : ''}`}
      >
        <HeroDisplay meme={heroMeme} />
        <div className="title-tag">💌 special invite</div>
        <h1>Will you go on a date with me?</h1>
        <p className="subtitle">
          I have something special planned for us<br />
          I promise it&apos;ll be wonderful ✨
        </p>

        <div className="btn-row">
          <button className="btn-date" onClick={() => go('s2')}>
            💖 Yes, Date!
          </button>
          <button
            ref={btnNotRef}
            className="btn-not"
            style={
              btnPos
                ? {
                    position:   'absolute',
                    left:       btnPos.x,
                    top:        btnPos.y,
                    transition: 'left .2s ease, top .2s ease',
                  }
                : undefined
            }
            onMouseOver={runAway}
            onTouchStart={runAway}
          >
            🙅 No
          </button>
        </div>

        <p className="refuse-msg">{refuseMsg}</p>
      </div>

      {/* ── S2: Food ──────────────────────────────────────────────────────── */}
      <div className={`screen${screen === 's2' ? ' active' : ''}`}>
        <Steps current={1} />
        <SectionBadge emoji="🍽️" title="What would you like to eat?" />
        <p className="section-sub">Pick whatever you fancy — I&apos;ll take care of the rest 😊</p>
        <div className="card-grid">
          {MENU_ITEMS.map(item => (
            <div
              key={item.name}
              className={`sel-card${menuChoice?.name === item.name ? ' selected' : ''}`}
              onClick={() => setMenuChoice(item)}
            >
              <div className="card-emoji">{item.emoji}</div>
              <div className="card-name">{item.name}</div>
              <div className="card-desc">{item.sub}</div>
            </div>
          ))}
        </div>
        <button
          className={`action-btn${menuChoice ? ' ready' : ''}`}
          onClick={() => menuChoice && go('s3')}
        >
          Next →
        </button>
        <button className="ghost-btn" onClick={() => go('s1')}>↩ Back</button>
      </div>

      {/* ── S3: Place ─────────────────────────────────────────────────────── */}
      <div className={`screen${screen === 's3' ? ' active' : ''}`}>
        <Steps current={2} />
        <SectionBadge emoji="🗺️" title="What kind of place after?" />
        <p className="section-sub">We&apos;ll head there right after dinner ☺️</p>
        <div className="card-grid">
          {PLACE_ITEMS.map(item => (
            <div
              key={item.name}
              className={`sel-card${placeChoice?.name === item.name ? ' selected' : ''}`}
              onClick={() => setPlaceChoice(item)}
            >
              <div className="card-emoji">{item.emoji}</div>
              <div className="card-name">{item.name}</div>
              <div className="card-desc">{item.sub}</div>
            </div>
          ))}
        </div>
        <button
          className={`action-btn${placeChoice ? ' ready' : ''}`}
          onClick={() => placeChoice && go('s4')}
        >
          Next →
        </button>
        <button className="ghost-btn" onClick={() => go('s2')}>↩ Back</button>
      </div>

      {/* ── S4: Date / Time / Location ────────────────────────────────────── */}
      <div className={`screen${screen === 's4' ? ' active' : ''}`}>
        <Steps current={3} />
        <SectionBadge emoji="📅" title="When & where shall we meet?" />
        <p className="section-sub">Fill in the details and we&apos;re all set 💕</p>

        <div className="form-box">
          <div className="form-row">
            {/* Date */}
            <div>
              <div className="field-label">📆 Date *</div>
              <input
                type="date"
                className="cute-input"
                value={dateVal}
                onChange={e => setDateVal(e.target.value)}
              />
            </div>

            {/* Time dropdown */}
            <div>
              <div className="field-label">🕐 Time *</div>
              <div className="custom-dd" id="time-dd">
                <div
                  className={`dd-trigger${ddOpen ? ' open' : ''}`}
                  onClick={() => setDdOpen(o => !o)}
                >
                  <span className={selTime ? 'dd-value' : 'dd-placeholder'}>
                    {selTime || 'Pick time'}
                  </span>
                  <span className="dd-arrow">▼</span>
                </div>
                {ddOpen && (
                  <div className="dd-menu open">
                    {TIME_GROUPS.map(g => (
                      <div key={g.label}>
                        <div className="dd-group-label">{g.label}</div>
                        {g.slots.map(t => (
                          <div
                            key={t}
                            className={`dd-item${selTime === t ? ' selected' : ''}`}
                            onClick={e => {
                              e.stopPropagation()
                              setSelTime(t)
                              setDdOpen(false)
                            }}
                          >
                            <span>{t}</span>
                            <span className="dd-item-period">{g.label}</span>
                            {selTime === t && <span className="dd-check">✓</span>}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Meeting spot */}
          <div>
            <div className="field-label">📍 Meeting spot *</div>
            <input
              type="text"
              className="cute-input"
              placeholder="e.g. Main entrance of Central World"
              value={locVal}
              onChange={e => setLocVal(e.target.value)}
            />
          </div>
        </div>

        <button
          className={`action-btn${form4Ready ? ' ready' : ''}`}
          onClick={() => form4Ready && goResult()}
        >
          See the plan ✨
        </button>
        <button className="ghost-btn" onClick={() => go('s3')}>↩ Back</button>
      </div>

      {/* ── S5: Result ────────────────────────────────────────────────────── */}
      <div className={`screen${screen === 's5' ? ' active' : ''}`}>
        <Steps current={4} />
        <div className="result-wrap">
          <div className="confetti-row">🎉🌹💕🌹🎉</div>
          <p className="result-title">Our Date Plan 💑</p>

          {plan && (
            <div className="plan-card">
              <PlanRow icon={plan.menu.emoji}  label="Dinner"       value={plan.menu.name}  sub={plan.menu.sub}  />
              <PlanRow icon={plan.place.emoji} label="After dinner" value={plan.place.name} sub={plan.place.sub} />
              <PlanRow icon="📅" label="Date & Time"  value={plan.dateStr} />
              <PlanRow icon="📍" label="Meeting spot" value={plan.loc}     />
            </div>
          )}

          <button
            className="send-btn"
            onClick={sendEmail}
            disabled={emailState === 'sending' || emailState === 'ok'}
          >
            {emailState === 'sending' && <><span className="loader" /><span>Preparing...</span></>}
            {emailState === 'ok'      && <><span>✅</span><span>All set!</span></>}
            {emailState === 'idle'    && <><span>💌</span><span>Send the Invite!</span></>}
          </button>

          {emailState === 'sending' && (
            <div className="email-status sending">
              <span className="loader" /> Preparing your invitation...
            </div>
          )}
          {emailState === 'ok' && (
            <div className="email-status ok">
              ✅ Ready to send!{' '}
              <a href={mailtoLink} target="_blank" rel="noreferrer">
                📨 Click here to send the email
              </a>
            </div>
          )}

          <button className="restart-btn" onClick={restart}>↩ Start over</button>
        </div>
      </div>

    </div>
  )
}