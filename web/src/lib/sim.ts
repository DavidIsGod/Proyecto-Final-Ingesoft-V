// Réplica en el navegador de la lógica del promotion-service (HealthStatusService):
//   CONFIRMED → contactos directos pasan a SUSPECT, contactos de segundo nivel ACTIVE pasan a PROBABLE
//   SUSPECT   → contactos directos pasan a PROBABLE
// Los contactos son miembros de un mismo círculo válido (MEMBER_OF en Neo4j).

export type Status = 'ACTIVE' | 'PROBABLE' | 'SUSPECT' | 'CONFIRMED' | 'RECOVERED'

export const STATUS_META: Record<Status, { label: string; color: string; gate: boolean }> = {
  ACTIVE: { label: 'Sin riesgo', color: 'var(--color-active)', gate: true },
  PROBABLE: { label: 'Probable', color: 'var(--color-probable)', gate: false },
  SUSPECT: { label: 'Sospechoso', color: 'var(--color-suspect)', gate: false },
  CONFIRMED: { label: 'Confirmado', color: 'var(--color-confirmed)', gate: false },
  RECOVERED: { label: 'Recuperado', color: 'var(--color-recovered)', gate: true },
}

const SEVERITY: Record<Status, number> = { ACTIVE: 0, RECOVERED: 0, PROBABLE: 1, SUSPECT: 2, CONFIRMED: 3 }

export type User = { id: string; circles: number[]; x: number; y: number; faculty: string; status: Status }
export type Circle = { id: number; name: string; x: number; y: number; fenced: boolean }
export type KafkaEvent = { id: number; topic: string; key: string; payload: string; at: number }

const CIRCLES = ['Cálculo III · G2', 'Lab. Redes', 'Semillero IA', 'Equipo Fútbol', 'Biblioteca 3er piso', 'Ing. Software V']
const FACULTIES = ['Ingeniería', 'Ciencias', 'Derecho', 'Medicina']

function seeded(seed: number) {
  let s = seed
  return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646
}

const round = (v: number) => Math.round(v * 10) / 10

export function createCampus() {
  const rnd = seeded(42)
  const W = 1000
  const H = 640
  const circles: Circle[] = CIRCLES.map((name, i) => {
    const a = (i / CIRCLES.length) * Math.PI * 2 - Math.PI / 2
    return { id: i, name, x: round(W / 2 + Math.cos(a) * 300), y: round(H / 2 + 14 + Math.sin(a) * 200), fenced: false }
  })

  const users: User[] = []
  let n = 0
  const mkId = () => `anon-${(0x3a7f + n++ * 2654435761).toString(16).slice(-4)}`

  // Miembros exclusivos de cada círculo
  circles.forEach((c) => {
    for (let k = 0; k < 7; k++) {
      const a = rnd() * Math.PI * 2
      const r = 34 + rnd() * 52
      users.push({ id: mkId(), circles: [c.id], x: round(c.x + Math.cos(a) * r), y: round(c.y + Math.sin(a) * r), faculty: FACULTIES[Math.floor(rnd() * FACULTIES.length)], status: 'ACTIVE' })
    }
  })
  // Puentes: personas en dos círculos vecinos (por aquí salta el contagio)
  circles.forEach((c, i) => {
    const next = circles[(i + 1) % circles.length]
    for (let k = 0; k < 2; k++) {
      const t = 0.4 + rnd() * 0.2
      users.push({
        id: mkId(),
        circles: [c.id, next.id],
        x: round(c.x + (next.x - c.x) * t + (rnd() - 0.5) * 30),
        y: round(c.y + (next.y - c.y) * t + (rnd() - 0.5) * 30),
        faculty: FACULTIES[Math.floor(rnd() * FACULTIES.length)],
        status: 'ACTIVE',
      })
    }
  })
  return { users, circles, width: W, height: H }
}

export type Campus = ReturnType<typeof createCampus>

const contacts = (users: User[], u: User) => users.filter((o) => o.id !== u.id && o.circles.some((c) => u.circles.includes(c)))

export type Propagation = { level1: string[]; level2: string[]; fenced: number[]; events: Omit<KafkaEvent, 'id' | 'at'>[] }

/** Aplica un cambio de estado y devuelve el nuevo campus + qué cambió en cada salto. */
export function updateStatus(campus: Campus, sourceId: string, status: Status): { campus: Campus; result: Propagation } {
  const users = campus.users.map((u) => ({ ...u }))
  const byId = new Map(users.map((u) => [u.id, u]))
  const src = byId.get(sourceId)!
  src.status = status

  const level1: string[] = []
  const level2: string[] = []
  const l1Status: Status | null = status === 'CONFIRMED' ? 'SUSPECT' : status === 'SUSPECT' ? 'PROBABLE' : null

  if (l1Status) {
    const firstHop = contacts(users, src).filter((c) => c.status !== 'CONFIRMED' && c.status !== 'RECOVERED')
    for (const c of firstHop) {
      if (SEVERITY[l1Status] > SEVERITY[c.status]) {
        c.status = l1Status
        level1.push(c.id)
      }
    }
    if (status === 'CONFIRMED') {
      for (const c1 of firstHop) {
        for (const c2 of contacts(users, c1)) {
          if (c2.status === 'ACTIVE' && c2.id !== src.id) {
            c2.status = 'PROBABLE'
            level2.push(c2.id)
          }
        }
      }
    }
  }

  const circles = campus.circles.map((c) => ({ ...c }))
  const fenced: number[] = []
  for (const c of circles) {
    const members = users.filter((u) => u.circles.includes(c.id))
    const all = members.every((u) => u.status !== 'ACTIVE' && u.status !== 'RECOVERED')
    if (all && !c.fenced) fenced.push(c.id)
    c.fenced = all
  }

  const affected = level1.length + level2.length
  const events: Propagation['events'] = [
    { topic: 'promotion.status.changed', key: src.id, payload: `{"status":"${status}","affected":${affected}}` },
  ]
  if (status === 'CONFIRMED' || affected > 20) {
    events.push({ topic: 'alert.priority', key: src.id, payload: `{"eventType":"${status === 'CONFIRMED' ? 'CONFIRMED_CASE' : 'LARGE_OUTBREAK'}"}` })
  }
  for (const id of fenced) events.push({ topic: 'circle.fenced', key: `circle-${id}`, payload: `{"name":"${circles[id].name}"}` })

  return { campus: { ...campus, users, circles }, result: { level1, level2, fenced, events } }
}

/** Analítica por facultad con k-anonimidad (KAnonymityFilter, K=5): grupos < K se enmascaran. */
export function facultyStats(users: User[], k = 5) {
  return FACULTIES.map((f) => {
    const members = users.filter((u) => u.faculty === f)
    const atRisk = members.filter((u) => SEVERITY[u.status] > 0).length
    const confirmed = members.filter((u) => u.status === 'CONFIRMED').length
    const mask = (v: number) => (v > 0 && v < k ? `<${k}` : String(v))
    return { faculty: f, total: members.length, atRisk: mask(atRisk), confirmed: mask(confirmed), atRiskRaw: atRisk }
  })
}
