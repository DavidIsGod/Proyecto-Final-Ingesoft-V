import { AnimatePresence, motion } from 'motion/react'
import { useMemo, useRef, useState } from 'react'
import { CampusGraph } from './components/CampusGraph'
import { Gate } from './components/Gate'
import { Analytics, Architecture } from './components/Panels'
import { createCampus, STATUS_META, updateStatus, type KafkaEvent, type Status } from './lib/sim'

export const PORTFOLIO_URL = import.meta.env.VITE_PORTFOLIO_URL ?? 'https://github.com/DavidIsGod'
const REPO_URL = 'https://github.com/DavidIsGod/Proyecto-Final-Ingesoft-V'

export default function App() {
  const initial = useMemo(() => createCampus(), [])
  const [campus, setCampus] = useState(initial)
  const [selected, setSelected] = useState<string | null>(initial.users[3].id)
  const [events, setEvents] = useState<KafkaEvent[]>([])
  const [wave, setWave] = useState<{ level1: string[]; level2: string[]; source: string; tick: number } | null>(null)
  const [last, setLast] = useState<{ l1: number; l2: number; fenced: number } | null>(null)
  const seq = useRef(0)

  const user = campus.users.find((u) => u.id === selected) ?? null
  const counts = (Object.keys(STATUS_META) as Status[]).map((s) => [s, campus.users.filter((u) => u.status === s).length] as const)

  function apply(status: Status) {
    if (!user) return
    const { campus: next, result } = updateStatus(campus, user.id, status)
    setCampus(next)
    setWave({ level1: result.level1, level2: result.level2, source: user.id, tick: Date.now() })
    setLast({ l1: result.level1.length, l2: result.level2.length, fenced: result.fenced.length })
    const now = Date.now()
    setEvents((ev) => [...result.events.map((e) => ({ ...e, id: seq.current++, at: now })), ...ev].slice(0, 12))
  }

  function reset() {
    setCampus(initial)
    setEvents([])
    setWave(null)
    setLast(null)
  }

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-40 border-b border-line/60 bg-bg/75 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 md:px-10">
          <a href={PORTFOLIO_URL} className="text-sm text-dim transition-colors hover:text-ink">
            ← David Troya
          </a>
          <p className="font-display font-semibold tracking-tight">
            Circle<span className="text-brand">Guard</span>
          </p>
          <a href={REPO_URL} target="_blank" rel="noreferrer" className="rounded-full border border-line px-4 py-1.5 text-sm transition-colors hover:border-brand">
            Código ↗
          </a>
        </div>
      </header>

      <main>
        <section className="px-5 pt-32 pb-12 md:px-10">
          <div className="mx-auto max-w-7xl">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-4xl font-display text-[clamp(2.6rem,6.5vw,5.8rem)] leading-[0.95] font-bold tracking-[-0.035em]"
            >
              Un caso positivo. Dos saltos. <span className="text-brand">Cero nombres.</span>
            </motion.h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-dim">
              Simulador de CircleGuard, el sistema de trazabilidad de contactos para campus. Elige a alguien en el grafo, repórtalo y mira cómo el
              promotion-service propaga el estado por los círculos de contacto, publica eventos en Kafka y actualiza la caché de Redis que consulta la
              puerta del campus.
            </p>
          </div>
        </section>

        <section id="simulador" className="px-5 pb-24 md:px-10">
          <div className="mx-auto grid max-w-7xl gap-4 lg:grid-cols-[1fr_22rem]">
            <div className="relative overflow-hidden rounded-3xl border border-line bg-panel">
              <div className="aspect-[1000/640] w-full">
                <CampusGraph campus={campus} selected={selected} wave={wave} onSelect={setSelected} />
              </div>
              <ul className="flex flex-wrap gap-x-5 gap-y-2 border-t border-line px-5 py-3 text-xs text-dim">
                {counts.map(([s, n]) => (
                  <li key={s} className="flex items-center gap-1.5">
                    <span className="size-2.5 rounded-full" style={{ background: STATUS_META[s].color }} />
                    {STATUS_META[s].label} <span className="font-mono text-ink">{n}</span>
                  </li>
                ))}
                <li className="ml-auto">
                  <button onClick={reset} className="text-dim underline-offset-4 hover:text-ink hover:underline">
                    Reiniciar campus
                  </button>
                </li>
              </ul>
            </div>

            <aside className="flex flex-col gap-4">
              <div className="rounded-3xl border border-line bg-panel p-5">
                {user ? (
                  <>
                    <p className="font-mono text-xs text-faint">identity-service · id anónimo</p>
                    <p className="mt-1 font-mono text-xl">{user.id}</p>
                    <p className="mt-2 flex items-center gap-2 text-sm">
                      <span className="size-2.5 rounded-full" style={{ background: STATUS_META[user.status].color }} />
                      {STATUS_META[user.status].label}
                      <span className="text-faint">· {user.circles.map((c) => campus.circles[c].name).join(' + ')}</span>
                    </p>
                    <div className="mt-5 grid grid-cols-2 gap-2">
                      <Action onClick={() => apply('SUSPECT')} color="var(--color-suspect)">
                        Reportar síntomas
                      </Action>
                      <Action onClick={() => apply('CONFIRMED')} color="var(--color-confirmed)">
                        Confirmar caso
                      </Action>
                      <Action onClick={() => apply('RECOVERED')} color="var(--color-recovered)">
                        Dar de alta
                      </Action>
                      <Action onClick={() => apply('ACTIVE')} color="var(--color-active)">
                        Override admin
                      </Action>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-dim">Toca un punto del grafo para seleccionar a una persona.</p>
                )}
                <AnimatePresence>
                  {last && (
                    <motion.p key={JSON.stringify(last)} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-4 rounded-xl bg-bg px-3 py-2 font-mono text-xs text-dim">
                      salto 1: <span className="text-suspect">{last.l1}</span> · salto 2: <span className="text-probable">{last.l2}</span> · círculos cercados:{' '}
                      <span className="text-confirmed">{last.fenced}</span>
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex-1 rounded-3xl border border-line bg-panel p-5">
                <p className="mb-3 font-mono text-xs text-faint">kafka · últimos eventos</p>
                <ul className="space-y-2 font-mono text-[0.7rem]">
                  <AnimatePresence initial={false}>
                    {events.length === 0 && <li className="text-faint">Sin eventos todavía.</li>}
                    {events.map((e) => (
                      <motion.li key={e.id} layout initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} className="rounded-lg border border-line bg-bg px-3 py-2">
                        <p className={e.topic === 'alert.priority' ? 'text-confirmed' : e.topic === 'circle.fenced' ? 'text-suspect' : 'text-brand'}>{e.topic}</p>
                        <p className="truncate text-dim">
                          {e.key} → {e.payload}
                        </p>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              </div>
            </aside>
          </div>
        </section>

        <Gate users={campus.users} />
        <Analytics users={campus.users} />
        <Architecture />
      </main>

      <footer className="border-t border-line px-5 py-12 md:px-10">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-3 text-sm text-dim md:flex-row">
          <p>Proyecto final · Ingeniería de Software V · Universidad Icesi</p>
          <p>
            Hecho por{' '}
            <a href={PORTFOLIO_URL} className="text-ink underline-offset-4 hover:underline">
              David Troya
            </a>
          </p>
        </div>
      </footer>
    </>
  )
}

function Action({ children, onClick, color }: { children: React.ReactNode; onClick: () => void; color: string }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 rounded-xl border border-line bg-bg px-3 py-2.5 text-left text-sm transition-colors hover:border-[color:var(--c)]"
      style={{ ['--c' as string]: color }}
    >
      <span className="size-2 shrink-0 rounded-full" style={{ background: color }} />
      {children}
    </button>
  )
}
