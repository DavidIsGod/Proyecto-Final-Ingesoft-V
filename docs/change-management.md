# Change Management — CircleGuard

## Flujo de cambios

1. **Propuesta**: issue en GitHub con descripción e impacto
2. **Desarrollo**: rama `feature/*` o `fix/*`
3. **Review**: PR con al menos 1 aprobación
4. **CI**: tests + Trivy deben pasar
5. **Stage**: merge a `main` → deploy automático a staging
6. **Producción**: tag semántico `vX.Y.Z` → aprobación en environment `production` → deploy

## Versionado

Formato semántico: `MAJOR.MINOR.PATCH`

- MAJOR: cambios incompatibles en APIs
- MINOR: funcionalidad nueva compatible
- PATCH: correcciones

## Release notes

- Generadas automáticamente en `.github/workflows/release.yml`
- Historial en `CHANGELOG.md` y `RELEASE_NOTES.md`

## Rollback

1. Identificar versión estable anterior (`git tag`)
2. `kubectl rollout undo deployment/<service> -n circleguard`
3. O redeploy imagen con tag anterior
4. Documentar incidente en issue post-mortem

## Ventana de cambios

- Stage: cualquier día laboral
- Producción: preferible martes/jueves 10:00-14:00 con equipo disponible
