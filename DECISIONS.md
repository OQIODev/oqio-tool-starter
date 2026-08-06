# DECISIONS

Une ligne par décision technique non évidente. Pas d'ADR formel — le but est qu'une session future ne re-litige pas un choix déjà fait.

Format : `AAAA-MM-JJ — décision — pourquoi`

La direction visuelle est une de ces lignes, avec une contrainte de plus : elle nomme ce qui est retenu, ce qui est exclu, et une **référence réelle** suivie de `aimée` ou `refusée`. C'est cette référence que `/verify` prend comme barre pour juger l'interface — une ligne sans référence laisse chaque tranche se comparer à elle-même.

- 2026-07-30 — Better Auth plutôt que Supabase Auth — users dans notre propre DB Prisma, donc identique sur Vercel et sur Hetzner. Coupe le dernier couplage à un provider.
- 2026-07-30 — `output: "standalone"` + Dockerfile dès le départ — le preset `durable` ne demande aucun changement de code.
- 2026-08-06 — le parcours réel de `/verify` est constaté par un sous-agent aveugle, et l'interface jugée contre une référence nommée — celui qui écrit le code reconnaît son intention au lieu de regarder l'écran, et une rubrique qu'on s'écrit à soi-même, on la passe toujours.
