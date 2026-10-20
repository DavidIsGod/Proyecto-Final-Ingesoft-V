import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import { STATUS_META, type User } from '../lib/sim'

type Scan = { user: User; ok: boolean; ms: number }

/** gateway-service: valida el QR contra el estado cacheado en Redis (user:status:{id}). */
export function Gate({ users }: { users: User[] }) {
  const [id, setId] = useState(users[0].id)
  const [scan, setScan] = useState<Scan | null>(null)
  const [scanning, setScanning] = useState(false)
  const user = users.find((u) => u.id === id)!

  function validate() {
    setScanning(true)
    setScan(null)
    setTimeout(() => {
      setScan({ user, ok: STATUS_META[user.status].gate, ms: 2 + Math.round(Math.random() * 4) })
      setScanning(false)
    }, 900)
  }

  return (
    <section className="px-5 py-24 md:px-10">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-2 lg:items-center">
        <div>
          <h2 className="font-display text-4xl font-bold tracking-tight md:text-5xl">La puerta solo pregunta a Redis.</h2>
          <p className="mt-4 max-w-lg text-lg leading-relaxed text-dim">
            Cada persona lleva un QR firmado por el auth-service. Al escanearlo, el gateway-service consulta el estado en la caché y abre o niega el
            paso en milisegundos, sin tocar la base ni conocer el nombre de nadie.
          </p>
          <label htmlFor="gate-user" className="mt-8 block text-sm text-dim">
            Persona en la puerta
          </label>
          <div className="mt-2 flex gap-2">
            <select
              id="gate-user"
              value={id}
              onChange={(e) => {
                setId(e.target.value)
                setScan(null)
              }}
              className="flex-1 rounded-xl border border-line bg-panel px-4 py-3 font-mono text-sm outline-none focus:border-brand"
            >
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.id} · {STATUS_META[u.status].label}
                </option>
              ))}
            </select>
            <button onClick={validate} disabled={scanning} className="rounded-xl bg-brand px-5 font-medium text-bg transition-opacity disabled:opacity-50">
              Escanear QR
            </button>
          </div>
        </div>

        <div className="relative mx-auto grid aspect-square w-full max-w-sm place-items-center overflow-hidden rounded-[2rem] border border-line bg-panel">
          <QR seed={id} />
          {scanning && (
            <motion.div className="absolute inset-x-8 h-0.5 bg-brand shadow-[0_0_24px_var(--color-brand)]" initial={{ top: '15%' }} animate={{ top: ['15%', '85%', '15%'] }} transition={{ duration: 0.9, ease: 'easeInOut' }} />
          )}
          <AnimatePresence>
            {scan && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 grid place-items-center backdrop-blur-sm"
                style={{ background: `color-mix(in oklab, ${scan.ok ? 'var(--color-recovered)' : 'var(--color-confirmed)'} 22%, transparent)` }}
              >
                <div className="text-center">
                  <p className="font-display text-5xl font-bold">{scan.ok ? 'Acceso' : 'Denegado'}</p>
                  <p className="mt-2 font-mono text-xs text-ink/80">
                    GET user:status:{scan.user.id} → {scan.user.status} · {scan.ms} ms
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}

function QR({ seed }: { seed: string }) {
  let h = 0
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) >>> 0
  const cells = Array.from({ length: 21 * 21 }, (_, i) => {
    const x = i % 21
    const y = Math.floor(i / 21)
    const finder = (x < 7 && y < 7) || (x > 13 && y < 7) || (x < 7 && y > 13)
    if (finder) {
      const fx = x > 13 ? x - 14 : x
      const fy = y > 13 ? y - 14 : y
      return fx === 0 || fx === 6 || fy === 0 || fy === 6 || (fx > 1 && fx < 5 && fy > 1 && fy < 5)
    }
    h = (h * 1103515245 + 12345) >>> 0
    return (h >> 16) % 2 === 0
  })
  return (
    <div className="grid w-3/5 grid-cols-[repeat(21,1fr)] gap-px rounded-lg bg-ink p-3" aria-hidden>
      {cells.map((on, i) => (
        <span key={i} className={`aspect-square ${on ? 'bg-bg' : 'bg-ink'}`} />
      ))}
    </div>
  )
}
