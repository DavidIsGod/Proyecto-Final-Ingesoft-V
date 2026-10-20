import { motion } from 'motion/react'
import { facultyStats, type User } from '../lib/sim'

export function Analytics({ users }: { users: User[] }) {
  const stats = facultyStats(users)
  return (
    <section className="px-5 py-24 md:px-10">
      <div className="mx-auto max-w-7xl">
        <h2 className="font-display text-4xl font-bold tracking-tight md:text-5xl">Analítica sin exponer a nadie</h2>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-dim">
          El dashboard-service aplica k-anonimidad con K = 5: cualquier grupo con menos de cinco personas se muestra como «&lt;5», para que nadie pueda
          deducir quién está enfermo en una facultad pequeña. Cambia estados en el grafo y mira cómo se actualiza.
        </p>
        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <motion.article key={s.faculty} layout className="rounded-2xl border border-line bg-panel p-5">
              <p className="text-sm text-dim">{s.faculty}</p>
              <p className="mt-3 font-display text-4xl font-bold tabular-nums">{s.atRisk}</p>
              <p className="text-xs text-faint">en riesgo de {s.total}</p>
              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-line">
                <motion.div className="h-full rounded-full bg-suspect" animate={{ width: s.atRisk.startsWith('<') ? '8%' : `${(s.atRiskRaw / s.total) * 100}%` }} />
              </div>
              <p className="mt-3 font-mono text-xs text-dim">
                confirmados: <span className="text-ink">{s.confirmed}</span>
              </p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}

const SERVICES = [
  ['auth-service', '8180', 'Login LDAP/local, JWT y QR firmado'],
  ['identity-service', '8083', 'Bóveda que mapea personas a IDs anónimos'],
  ['form-service', '8086', 'Encuestas de salud → evento en Kafka'],
  ['promotion-service', '8088', 'Grafo Neo4j y propagación de estados'],
  ['notification-service', '8082', 'Email, SMS y push a los contactos'],
  ['gateway-service', '8087', 'Validación de QR contra Redis en la puerta'],
  ['dashboard-service', '8084', 'Analítica agregada con k-anonimidad'],
  ['file-service', '8085', 'Certificados y soportes médicos'],
]

export function Architecture() {
  return (
    <section className="px-5 py-24 md:px-10">
      <div className="mx-auto max-w-7xl">
        <h2 className="font-display text-4xl font-bold tracking-tight md:text-5xl">Ocho servicios, un clúster</h2>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-dim">
          Spring Boot sobre Kubernetes, aprovisionado con Terraform, con CI/CD en GitHub Actions, observabilidad y pruebas de carga y seguridad.
        </p>
        <ul className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          {SERVICES.map(([name, port, desc], i) => (
            <motion.li
              key={name}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: (i % 4) * 0.06 }}
              className="bg-panel p-5"
            >
              <p className="font-mono text-sm text-brand">{name}</p>
              <p className="mt-1 font-mono text-xs text-faint">:{port}</p>
              <p className="mt-3 text-sm leading-relaxed text-dim">{desc}</p>
            </motion.li>
          ))}
        </ul>
        <p className="mt-6 flex flex-wrap gap-2 font-mono text-xs text-dim">
          {['PostgreSQL', 'Neo4j', 'Kafka', 'Redis', 'OpenLDAP', 'Expo (app móvil)', 'Kubernetes', 'Terraform', 'Prometheus + Grafana', 'Locust', 'OWASP ZAP'].map((t) => (
            <span key={t} className="rounded-full border border-line px-3 py-1">
              {t}
            </span>
          ))}
        </p>
      </div>
    </section>
  )
}
