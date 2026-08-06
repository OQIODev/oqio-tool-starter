# oqio-tool-starter

Un starter Next.js **et** la boucle de trois skills Claude Code qui le fait avancer : cadrer, livrer tranche par tranche, vérifier pour de vrai.

C'est le setup qu'on utilise chez [OQIO](https://oqio.ch) pour sortir nos outils internes. Il est publié tel quel, partis pris compris. La partie qui vaut probablement le détour n'est pas la stack — c'est la boucle.

## La boucle

Trois skills, dans `.claude/skills/`. Elles font 55 lignes chacune. Claude Code les charge automatiquement quand tu ouvres le dossier.

| Skill | Quand | Ce qu'il fait |
|---|---|---|
| `/cadrage` | Une fois, au début | Idée → `SPEC.md` court + `BACKLOG.md` de tranches verticales |
| `/slice` | À répétition | Livre une tranche de bout en bout : plan, test, code, vérif, commit |
| `/verify` | Avant de clore | Checks automatiques **et** parcours réel dans l'app qui tourne |

Trois choses les rendent différentes d'un prompt bien tourné.

**Le juge est aveugle.** Celui qui a écrit le code ne constate pas son propre critère — il reconnaît son intention au lieu de regarder l'écran. `/verify` confie donc le parcours à un sous-agent en contexte frais, qui lance l'app, pilote le navigateur, et à qui il est **interdit** de lire le diff, le dernier commit ou le compte rendu. Il constate ce qui est à l'écran, pas ce que le code prétend faire. Il rend `CONSTATÉ`, `INFIRMÉ` ou `PAS PU CONSTATER`. Si c'est `INFIRMÉ`, on corrige et on relance un sous-agent **neuf** — jamais celui qui a vu la version cassée, il validerait la correction sur parole.

**Rien n'est fini parce que ça compile.** Un build vert ne prouve rien sur un outil. Aucune tranche ne se clôt sans avoir été vue tourner, et le compte rendu doit dire ce qui a été sauté plutôt que de le présenter comme validé.

**La boucle a un critère d'arrêt.** Quand le backlog est vide, `/slice` écrit `<promise>BACKLOG VIDE</promise>` et s'arrête. C'est ce qui la rend automatisable — avec `/loop` ou le plugin `ralph-loop`, tu lances et tu reviens plus tard. La skill a `AskUserQuestion` en `disallowed-tools` justement pour ne pas se bloquer sur une question au milieu de la nuit.

Aide-mémoire complet — quel skill à quel moment, et quoi faire quand ça déraille : [WORKFLOW.md](WORKFLOW.md).

## Essayer

```bash
git clone https://github.com/OQIODev/oqio-tool-starter.git mon-outil
cd mon-outil && rm -rf .git && git init
npm install
cp .env.example .env.local        # remplir BETTER_AUTH_SECRET (openssl rand -base64 32)
docker compose up -d              # Postgres local
npx prisma migrate deploy         # les tables auth sont déjà migrées dans le starter
npm run dev
```

Puis, dans Claude Code : `/cadrage` pour poser `SPEC.md` et `BACKLOG.md`, ensuite `/slice` autant de fois qu'il y a de tranches.

## Ce qui est tranché — et à quel prix

Ce starter n'est pas neutre. La règle qui structure tout est dans [CLAUDE.md](CLAUDE.md) : **un seul chemin pour chaque chose**. Un seul accès données, une seule façon de gérer les erreurs de route, une seule façon de logger. C'est ce qui permet à `/slice` de tourner sans supervision — un agent qui a le choix entre deux façons de faire en invente une troisième.

Le corollaire, c'est que les choix sont faits pour toi :

| Choix | Ce que ça coûte de s'en écarter |
|---|---|
| Next.js 16 (App Router) | Le plus cher. La structure `src/app`, le proxy, le Dockerfile standalone en dépendent |
| Postgres + Prisma 7 | Moyen. Un autre ORM = réécrire l'accès données et les tests d'intégration |
| Better Auth | Moyen. L'auth est déjà migrée et testée e2e ; changer, c'est refaire les trois |
| Tailwind v4 + shadcn/ui | Faible. Tokens `@theme` dans `globals.css`, remplaçables |
| Coolify sur Hetzner, ou Vercel + Neon | Faible. Deux presets, même code. Tout hébergeur qui construit un Dockerfile marche |

Le déploiement est le point le plus « maison » : on héberge chez Hetzner via Coolify. Mais c'est un `Dockerfile` standard et un `docker-entrypoint.sh` qui applique les migrations au démarrage — rien qui t'enferme chez cet hébergeur-là.

## Ce qui est déjà là

- Auth email/mot de passe complète (Better Auth) : inscription, connexion, déconnexion, session serveur vérifiée, proxy de redirection
- Postgres + Prisma 7 avec adapter `pg` et client singleton
- `withErrorHandling` pour les routes API, logger JSON structuré, `AuthError`
- Headers de sécurité (CSP en report-only — à basculer en enforce avant la mise en prod)
- Route `/api/health` qui teste la DB, pour les sondes d'uptime
- Trois niveaux de test qui tournent vraiment : 8 tests unitaires, 3 d'intégration contre un vrai Postgres, 3 e2e du parcours d'authentification dans un navigateur. Les deux derniers créent leur **propre** base — jamais celle du dev
- Dockerfile standalone qui applique les migrations au démarrage, + `docker-compose.yml`

## Brancher la boucle sur ta stack

Si tu veux la boucle sans le starter — sur du Rails, du SvelteKit, du Go — elle est portable. Le couplage tient en cinq endroits :

1. **[CLAUDE.md](CLAUDE.md)** — le vrai travail. Le tableau « un seul chemin pour chaque chose » et le bloc Commandes déclarent ta stack. C'est ce fichier que les skills lisent pour savoir comment tu travailles.
2. **`.claude/skills/verify/SKILL.md:5`** — `allowed-tools` liste `npm run *`, `npx prisma *`, `docker compose *`. À remplacer par tes commandes.
3. **`.claude/skills/verify/SKILL.md:24-26`** — préparation de l'infra avant le parcours (base qui tourne, migrations à jour) et la note sur le serveur de dev.
4. **`.claude/skills/slice/SKILL.md:40`** et **`verify:13`** — `npm run verify` (lint + typecheck + tests unitaires). Une seule commande qui doit sortir en code 0.
5. **`.claude/skills/cadrage/SKILL.md:22`** — la question sur le preset de déploiement.

Le reste — le juge aveugle, `BACKLOG VIDE`, la règle du « vu tourner » — ne dépend d'aucune techno.

## Déploiement

Même code, deux presets :

- **quick** — Vercel + Postgres managé (Neon). `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` en variables d'env.
- **durable** — Coolify sur Hetzner. Coolify construit le `Dockerfile`, la DB est un service Postgres à côté.

Dans les deux cas, les seules variables à fournir sont `DATABASE_URL`, `BETTER_AUTH_SECRET` (un secret **distinct** de celui du dev) et `BETTER_AUTH_URL` (l'URL publique, en https).

**Les migrations n'ont pas d'étape manuelle** : `docker-entrypoint.sh` lance `migrate deploy` avant de démarrer le serveur. C'est idempotent, donc sans effet quand il n'y a rien à appliquer. Si la base est injoignable ou `DATABASE_URL` absent, le conteneur sort en code 1 plutôt que de servir des requêtes sur un schéma qui n'est pas celui du code.

## Conventions

Tout est dans [CLAUDE.md](CLAUDE.md). Les décisions techniques non évidentes sont tracées dans [DECISIONS.md](DECISIONS.md), une ligne chacune.

## Pas de support

C'est un starter maison, publié parce qu'il peut servir — pas un projet communautaire. Il évolue selon nos besoins et peut casser sans préavis. Forke, adapte, garde ce qui te va. Les issues et PR ne seront pas forcément suivies : le meilleur usage de ce repo, c'est d'en prendre les idées.

MIT. Fais-en ce que tu veux.
