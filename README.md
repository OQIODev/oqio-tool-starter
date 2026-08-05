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
- Trois niveaux de test qui tournent vraiment : 8 tests unitaires (logger, gestion d'erreurs), 3 d'intégration contre un vrai Postgres, 3 e2e du parcours d'authentification dans un navigateur. Les deux derniers créent leur propre base — jamais celle du dev
- Dockerfile standalone qui applique les migrations au démarrage, + `docker-compose.yml`

## Déploiement

Même code, deux presets :

- **quick** — Vercel + Postgres managé (Neon). `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` en variables d'env.
- **durable** — Coolify sur Hetzner. Coolify construit le `Dockerfile`, la DB est un service Postgres à côté.

Dans les deux cas, les seules variables à fournir sont `DATABASE_URL`, `BETTER_AUTH_SECRET` (un secret **distinct** de celui du dev) et `BETTER_AUTH_URL` (l'URL publique, en https).

**Les migrations n'ont pas d'étape manuelle** : `docker-entrypoint.sh` lance `migrate deploy` avant de démarrer le serveur. C'est idempotent, donc sans effet quand il n'y a rien à appliquer. Si la base est injoignable ou `DATABASE_URL` absent, le conteneur sort en code 1 plutôt que de servir des requêtes sur un schéma qui n'est pas celui du code.

## Conventions

Tout est dans [CLAUDE.md](CLAUDE.md). La règle centrale : **un seul chemin pour chaque chose**.

## Faire évoluer le starter

Ce qu'un projet t'apprend remonte ici — mais seulement ce qui a survécu à un vrai outil. Les technos à tester vont dans un bac à sable séparé, pas dans le starter.
