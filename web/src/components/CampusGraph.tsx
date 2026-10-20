import { motion } from 'motion/react'
import { STATUS_META, type Campus } from '../lib/sim'

type Props = {
  campus: Campus
  selected: string | null
  wave: { level1: string[]; level2: string[]; source: string; tick: number } | null
  onSelect: (id: string) => void
}

/** Grafo de círculos de contacto: hubs = círculos (Neo4j :Circle), puntos = usuarios anónimos. */
export function CampusGraph({ campus, selected, wave, onSelect }: Props) {
  const byId = new Map(campus.users.map((u) => [u.id, u]))
  const src = wave ? byId.get(wave.source) : null

  return (
    <svg viewBox={`0 0 ${campus.width} ${campus.height}`} className="h-full w-full" role="img" aria-label="Grafo de contactos del campus">
      <defs>
        <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="1" fill="var(--color-line)" />
        </pattern>
      </defs>
      <rect width={campus.width} height={campus.height} fill="url(#grid)" />

      {/* MEMBER_OF */}
      {campus.users.flatMap((u) =>
        u.circles.map((cid) => {
          const c = campus.circles[cid]
          const hot = u.status !== 'ACTIVE' && u.status !== 'RECOVERED'
          return <line key={u.id + cid} x1={u.x} y1={u.y} x2={c.x} y2={c.y} stroke={hot ? STATUS_META[u.status].color : 'var(--color-line)'} strokeOpacity={hot ? 0.5 : 1} strokeWidth={1} style={{ transition: 'stroke 0.6s' }} />
        }),
      )}

      {campus.circles.map((c) => (
        <g key={c.id}>
          <circle cx={c.x} cy={c.y} r={96} fill="none" stroke={c.fenced ? 'var(--color-confirmed)' : 'var(--color-line)'} strokeDasharray={c.fenced ? '0' : '3 6'} strokeWidth={c.fenced ? 1.5 : 1} style={{ transition: 'stroke 0.6s' }} />
          <circle cx={c.x} cy={c.y} r={5} fill={c.fenced ? 'var(--color-confirmed)' : 'var(--color-dim)'} />
          <text x={c.x} y={c.y - 104} textAnchor="middle" fontSize={13} fill="var(--color-dim)" fontFamily="Inter, sans-serif">
            {c.name}
            {c.fenced ? ' · cercado' : ''}
          </text>
        </g>
      ))}

      {/* Ondas de propagación: nivel 1 y nivel 2 */}
      {wave && src && (
        <g key={wave.tick}>
          {[0, 1].map((lvl) => (
            <motion.circle
              key={lvl}
              cx={src.x}
              cy={src.y}
              fill="none"
              stroke={lvl === 0 ? 'var(--color-suspect)' : 'var(--color-probable)'}
              strokeWidth={2}
              initial={{ r: 6, opacity: 0.9 }}
              animate={{ r: 420, opacity: 0 }}
              transition={{ duration: 1.8, delay: lvl * 0.6, ease: 'easeOut' }}
            />
          ))}
        </g>
      )}

      {campus.users.map((u) => {
        const meta = STATUS_META[u.status]
        const isSel = u.id === selected
        const delay = wave ? (wave.level1.includes(u.id) ? 0.35 : wave.level2.includes(u.id) ? 0.95 : 0) : 0
        return (
          <g key={u.id} onClick={() => onSelect(u.id)} className="cursor-pointer" role="button" aria-label={`${u.id}, ${meta.label}`}>
            <circle cx={u.x} cy={u.y} r={14} fill="transparent" />
            {isSel && <circle cx={u.x} cy={u.y} r={13} fill="none" stroke="var(--color-brand)" strokeWidth={2} />}
            <circle
              cx={u.x}
              cy={u.y}
              r={u.circles.length > 1 ? 7.5 : 6}
              stroke="var(--color-bg)"
              strokeWidth={2}
              style={{ fill: meta.color, transition: `fill 0.5s ease ${delay}s` }}
            />
          </g>
        )
      })}
    </svg>
  )
}
