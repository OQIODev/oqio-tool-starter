# CLAUDE.md

## L'outil
Voir [SPEC.md](SPEC.md) pour ce qu'on construit, [CONTEXT.md](CONTEXT.md) pour le vocabulaire du domaine et [BACKLOG.md](BACKLOG.md) pour les tranches restantes. Si SPEC.md est encore le template vide, lancer `/cadrage` avant d'écrire du code.

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
| Couleurs et typo | Les tokens `@theme` de `src/app/globals.css` — jamais une valeur en dur |
| Barre d'utilisabilité de l'interface | `.claude/rules/web-interface-guidelines.md` — figé, jamais refetché en cours de vérification |
| Coder une interface | `/ecran` — il exécute la direction de `DECISIONS.md`, il ne la rediscute pas |
| Bug qui résiste à une première correction | `/debug` — une commande rouge avant toute hypothèse, jamais de correctif au hasard |

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
npm test                 # Tests unit, une passe
npm run test:watch       # Vitest en watch — le seul mode qui ne rend pas la main
npm run test:integration # Vitest contre un vrai Postgres (base <base>_test)
npm run test:e2e         # Playwright, navigateur réel (base <base>_e2e, port 3100)
npx prisma migrate dev   # Nouvelle migration (dev)
docker compose up -d     # Postgres local
```

Tout ce qui porte `test` tourne en une passe et rend la main. `test:watch` est le seul watcher, il se lance sur intention et se coupe à la main — un watcher oublié tient son pool de workers en vie pour la journée.

`test:integration` et `test:e2e` ont besoin de Postgres lancé et créent leur **propre** base — jamais celle du dev. Deux choses à savoir sur `test:e2e` : au premier passage sur une machine, `npx playwright install chromium` ; et **arrêter le `npm run dev`** avant de le lancer, Next 16 refuse un second serveur de dev sur le même dossier.

## Guardrails
- `npm run verify` doit passer avant tout commit. Pas d'exception.
- Une tranche = un commit. Format : `type(scope): description` (feat, fix, refactor, chore, docs, test). Son corps porte le constat de vérification.
- Ne jamais déclarer une tranche finie sans l'avoir vue tourner — voir `/verify`.
- Décision technique non évidente → une ligne dans [DECISIONS.md](DECISIONS.md).
- Le vocabulaire du domaine vit dans [CONTEXT.md](CONTEXT.md). Un terme qui apparaît y entre avec sa définition et les synonymes à ne pas employer ; variables, fonctions et fichiers s'y conforment. Deux mots pour la même chose, c'est du code qui divergera.
- [SPEC.md](SPEC.md) ne se modifie plus après le cadrage — seule sa section « À trancher » rétrécit. Ce qui change en route va dans DECISIONS.md.
- Direction visuelle tranchée **une fois** : au cadrage si le projet en sort, sinon à la première tranche d'interface, qui doit alors le signaler dans son compte rendu. Une ligne dans [DECISIONS.md](DECISIONS.md), les valeurs dans `globals.css`. Les tranches suivantes s'y conforment, elles ne la rejouent pas.
- Élément hors périmètre de la tranche en cours → l'écrire dans BACKLOG.md, ne pas le traiter maintenant.
- [BACKLOG.md](BACKLOG.md) ne peut que rétrécir : une tranche livrée en sort, elle ne se coche pas. Ce qui est fait vit dans `git log`.
- Le constat de vérification va dans [JOURNAL.md](JOURNAL.md) et le corps du commit, jamais dans BACKLOG.md. `JOURNAL.md` ne se lit **jamais** au démarrage d'une tranche — c'est ce qui l'autorise à grossir sans rien coûter.

## Déploiement
Deux presets, même code :
- **quick** — Vercel + Postgres managé (Neon). Pour publier vite.
- **durable** — Docker standalone → Coolify sur Hetzner. `DATABASE_URL` pointe le Postgres du serveur. Les migrations s'appliquent au démarrage du conteneur (`docker-entrypoint.sh`) — pas d'étape manuelle.
