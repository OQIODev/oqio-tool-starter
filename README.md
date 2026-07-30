# OQIO Tool Starter

Squelette pour développer un outil interne OQIO avec Claude Code. Il porte la stack, les conventions et la routine de travail — de sorte qu'un nouvel outil ne se spécifie plus qu'au niveau du produit.

## Démarrer un nouvel outil

```bash
git clone <ce-repo> mon-outil && cd mon-outil && rm -rf .git && git init
npm install
cp .env.example .env.local        # remplir BETTER_AUTH_SECRET (openssl rand -base64 32)
docker compose up -d              # Postgres local
npx prisma migrate deploy         # les tables auth sont déjà migrées dans le starter
npm run dev
```

Puis, dans Claude Code : `/cadrage` pour poser `SPEC.md` et `BACKLOG.md`, ensuite `/slice` autant de fois qu'il y a de tranches.

## La routine

Aide-mémoire complet — quel skill à quel moment, et quoi faire quand ça déraille : [WORKFLOW.md](WORKFLOW.md).

| Skill | Quand | Ce qu'il fait |
|---|---|---|
| `/cadrage` | Une fois, au début | Idée → `SPEC.md` court + `BACKLOG.md` de tranches verticales |
| `/slice` | À répétition | Livre une tranche de bout en bout : plan, test, code, vérif, commit |
| `/verify` | Avant de clore | Checks automatiques **et** parcours réel dans l'app qui tourne |

`/slice` s'arrête sur `BACKLOG VIDE` — ce qui en fait un critère d'arrêt utilisable pour une boucle (`/loop`, plugin `ralph-loop`).

## Ce qui est déjà là

- Auth email/mot de passe complète (Better Auth) : inscription, connexion, déconnexion, session serveur vérifiée, proxy de redirection
- Postgres + Prisma 7 avec adapter `pg` et client singleton
- `withErrorHandling` pour les routes API, logger JSON structuré, `AuthError`
- Headers de sécurité (CSP en report-only — à basculer en enforce avant la mise en prod)
- Route `/api/health` qui teste la DB, pour les sondes d'uptime
- Vitest configuré avec 8 tests qui couvrent le logger et la gestion d'erreurs
- Dockerfile standalone + `docker-compose.yml`

## Déploiement

Même code, deux presets :

- **quick** — Vercel + Postgres managé (Neon). `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` en variables d'env.
- **durable** — Coolify sur Hetzner. Coolify construit le `Dockerfile`, la DB est un service Postgres à côté. Lancer `npx prisma migrate deploy` au déploiement.

## Conventions

Tout est dans [CLAUDE.md](CLAUDE.md). La règle centrale : **un seul chemin pour chaque chose**.

## Faire évoluer le starter

Ce qu'un projet t'apprend remonte ici — mais seulement ce qui a survécu à un vrai outil. Les technos à tester vont dans un bac à sable séparé, pas dans le starter.
