# CLAUDE.md

## L'outil
Voir [SPEC.md](SPEC.md) pour ce qu'on construit et [BACKLOG.md](BACKLOG.md) pour les tranches restantes. Si SPEC.md est encore le template vide, lancer `/cadrage` avant d'écrire du code.

Routine de travail et choix des skills : [WORKFLOW.md](WORKFLOW.md).

## Stack
Next.js 16 (App Router, Turbopack) · TypeScript strict · Postgres + Prisma 7 · Better Auth · Vercel AI SDK 6 · Tailwind v4 + shadcn/ui · Vitest + Playwright · Docker standalone.

## Un seul chemin pour chaque chose
C'est la règle qui compte le plus. Il existe exactement une façon de faire chacune de ces choses — ne pas en inventer une deuxième :

| Besoin | Le seul chemin |
|---|---|
| Accès données | Prisma via `@/lib/db/prisma` |
| Erreurs de route API | `withErrorHandling("nom", handler)` |
| Auth serveur (route, action, page) | `requireAuthUser()` ou `getAuthUser()` de `@/lib/auth/session` |
| Auth navigateur | `signIn` / `signUp` / `signOut` / `useSession` de `@/lib/auth/client` |
| Logs serveur | `logInfo` / `logWarn` / `logError` de `@/lib/utils/logger` |
| Validation d'entrée | Zod |
| Classes CSS conditionnelles | `cn()` de `@/lib/utils/cn` |

Le check du [proxy](src/proxy.ts) est **optimiste** (présence de cookie, pas de hit DB). Il ne remplace jamais `requireAuthUser()` côté serveur.

## Conventions
- camelCase variables/fonctions · PascalCase types/composants · kebab-case fichiers/dossiers
- Pas de `any` sans commentaire qui le justifie
- Composants fonctionnels + hooks. React 19 : pas de `setState` dans `useEffect`
- Imports via l'alias `@/` → `src/`
- Types partagés dans `src/types/`, jamais inline dans un composant
- `components/ui/` = shadcn générique · `components/features/` = métier
- Pas de `console.log` dans le code serveur — le logger, sinon rien

## Commandes
```
npm run dev              # Dev (port 3000)
npm run verify           # lint + typecheck + tests unit — à passer avant tout commit
npm run build            # Build production
npm run test:e2e         # Playwright
npx prisma migrate dev   # Nouvelle migration (dev)
docker compose up -d     # Postgres local
```

## Guardrails
- `npm run verify` doit passer avant tout commit. Pas d'exception.
- Une tranche = un commit. Format : `type(scope): description` (feat, fix, refactor, chore, docs, test).
- Ne jamais déclarer une tranche finie sans l'avoir vue tourner — voir `/verify`.
- Décision technique non évidente → une ligne dans [DECISIONS.md](DECISIONS.md).
- Élément hors périmètre de la tranche en cours → l'écrire dans BACKLOG.md, ne pas le traiter maintenant.

## Déploiement
Deux presets, même code :
- **quick** — Vercel + Postgres managé (Neon). Pour publier vite.
- **durable** — Docker standalone → Coolify sur Hetzner. `DATABASE_URL` pointe le Postgres du serveur, `migrate deploy` au déploiement.
