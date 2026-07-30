# DECISIONS

Une ligne par décision technique non évidente. Pas d'ADR formel — le but est qu'une session future ne re-litige pas un choix déjà fait.

Format : `AAAA-MM-JJ — décision — pourquoi`

- 2026-07-30 — Better Auth plutôt que Supabase Auth — users dans notre propre DB Prisma, donc identique sur Vercel et sur Hetzner. Coupe le dernier couplage à un provider.
- 2026-07-30 — `output: "standalone"` + Dockerfile dès le départ — le preset `durable` ne demande aucun changement de code.
