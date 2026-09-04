# oqio-tool-starter

Un starter Next.js **et** la boucle de trois skills Claude Code qui le fait avancer : cadrer, livrer tranche par tranche, vérifier pour de vrai.

C'est le setup qu'on utilise chez [OQIO](https://oqio.ch) pour sortir nos outils internes. Il est publié tel quel, partis pris compris. La partie qui vaut probablement le détour n'est pas la stack — c'est la boucle.

## La boucle

Cinq skills, dans `.claude/skills/`, courtes — de l'ordre de quatre-vingts à cent lignes chacune. Trois portent la boucle, deux s'enclenchent seules quand il faut.

`/cadrage` et `/slice` sont des **commandes** : tu les tapes, elles ne se déclenchent jamais d'elles-mêmes et ne coûtent donc rien au contexte permanent (`disable-model-invocation: true`). `/verify`, `/ecran` et `/debug` restent invocables par l'agent, parce que `/slice` les appelle — une skill user-invoked peut en appeler une model-invocable, jamais une autre user-invoked.

| Skill | Quand | Ce qu'il fait |
|---|---|---|
| `/cadrage` | Une fois, au début | Idée → `SPEC.md` court, `BACKLOG.md` de tranches verticales, `CONTEXT.md` du vocabulaire |
| `/slice` | À répétition | Livre une tranche de bout en bout : plan, test, code, vérif, commit |
| `/verify` | Avant de clore | Checks automatiques **et** parcours réel dans l'app qui tourne |
| `/ecran` | Dès qu'une tranche touche à l'interface | Exécute la direction visuelle tranchée au cadrage, sans en proposer une autre |
| `/debug` | Quand une correction a raté | Construit une commande qui passe au **rouge**, puis réduit, hypothétise, verrouille |

Quatre choses les rendent différentes d'un prompt bien tourné.

**Le juge est aveugle.** Celui qui a écrit le code ne constate pas son propre critère — il reconnaît son intention au lieu de regarder l'écran. `/verify` confie donc le parcours à un sous-agent en contexte frais, qui lance l'app, pilote le navigateur, et à qui il est **interdit** de lire le diff, le dernier commit ou le compte rendu. Il constate ce qui est à l'écran, pas ce que le code prétend faire. Il rend `CONSTATÉ`, `INFIRMÉ` ou `PAS PU CONSTATER`. Si c'est `INFIRMÉ`, on corrige et on relance un sous-agent **neuf** — jamais celui qui a vu la version cassée, il validerait la correction sur parole.

**Chaque étape porte sa condition de fin, et rien n'est fini parce que ça compile.** Les cinq étapes de `/slice` se terminent sur un fait vérifiable — un critère recopié, un test vu échouer, un verdict rendu — et pas sur le sentiment d'avoir fini. Un build vert ne prouve rien sur un outil. Aucune tranche ne se clôt sans avoir été vue tourner, et le compte rendu doit dire ce qui a été sauté plutôt que de le présenter comme validé.

**La boucle a un critère d'arrêt.** Quand le backlog est vide, `/slice` écrit `<promise>BACKLOG VIDE</promise>` et s'arrête. C'est ce qui la rend automatisable, à deux niveaux de garantie : avec le plugin `ralph-loop`, un Stop hook compare cette chaîne à celle qu'on lui a passée et coupe la boucle — l'arrêt est vérifié par un script, pas par le modèle ; avec `/loop` (natif, marche partout), la boucle tourne aussi mais l'arrêt reste une décision du modèle. La skill a `AskUserQuestion` en `disallowed-tools` justement pour ne pas se bloquer sur une question au milieu de la nuit.

**Le backlog ne peut que rétrécir.** Une tranche livrée n'est pas cochée, elle est **retirée** du fichier, dans le même commit que le code — et son constat de vérification part dans [JOURNAL.md](JOURNAL.md) et dans le corps de ce commit. `BACKLOG.md` ne dit donc jamais que ce qui reste à faire, et `git log -p -- BACKLOG.md` rend chaque tranche livrée avec son critère, verbatim. Ce qui est livré **sans avoir été prouvé** va dans une section « Réserves » : c'est ce qu'on cherche en premier trois semaines plus tard, et c'est sinon enterré dans des tranches marquées faites.

On l'a appris en mesurant. Sur un de nos outils, le backlog a pris 176 Ko en huit jours, dont 91 % de récit que personne n'avait demandé — au point qu'un seul `Read` n'en servait plus qu'un tiers, et que la section listant le travail restant tombait dans la partie tronquée. Huntley l'écrit en majuscules dans la source qu'on crédite plus bas : `DO NOT PLACE STATUS REPORT UPDATES INTO @AGENT.md`. On avait pris sa boucle sans sa règle d'hygiène. Si tu travailles en branches avec squash-merge, garde en tête que le corps du commit est une archive et qu'un squash l'écrase ; `JOURNAL.md`, lui, survit.

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

Puis, dans Claude Code : `/cadrage` pour poser `SPEC.md`, `BACKLOG.md` et `CONTEXT.md`, ensuite `/slice` autant de fois qu'il y a de tranches.

### Prérequis

**Aucun.** Les cinq skills sont dans le dépôt, elles n'ont rien à installer et rien à mettre à jour. Le starter se clone et fonctionne.

C'est délibéré. Un plugin de design, on l'a essayé : il est écrit pour proposer une direction neuve à chaque génération — l'un d'eux ordonne littéralement de ne jamais converger d'une fois sur l'autre. Sur un backlog de six tranches, c'est l'inverse de ce qu'on veut, et on passait notre temps à neutraliser sa consigne principale. `/ecran` fait le travail dans le bon sens : il exécute la direction tranchée au cadrage.

En particulier **pas** de `superpowers` : ses skills recouvrent cette boucle case pour case et son hook `SessionStart` gagne systématiquement contre `/cadrage` (`.claude/settings.json` le désactive explicitement, voir `DECISIONS.md`).

Un seul plugin reste utile, et il est optionnel : `ralph-loop`, pour lancer la boucle sans surveillance depuis un **terminal**. Son Stop hook compare `<promise>BACKLOG VIDE</promise>` à la chaîne attendue, caractère par caractère, et plafonne les tours avec `--max-iterations` : l'arrêt est vérifié hors du modèle. `/loop /slice` boucle aussi, partout, mais s'y arrête quand le modèle *décide* qu'il a fini.

```bash
claude plugin install ralph-loop@claude-plugins-official
```

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
2. **`verify`, frontmatter** — `allowed-tools` liste `npm run *`, `npx prisma *`, `docker compose *`. À remplacer par tes commandes.
3. **`verify`, § « Parcours réel »** — la préparation de l'infra avant le parcours (base qui tourne, migrations à jour) et la note sur le serveur de dev.
4. **`slice`, § « Implémenter »** et **`verify`, § « Checks automatiques »** — `npm run verify` (lint + typecheck + tests unitaires). Une seule commande qui doit sortir en code 0.
5. **`cadrage`, § « Les six axes »** — la question sur le preset de déploiement.
6. **`.claude/rules/web-interface-guidelines.md`** — la barre d'utilisabilité, reprise de [vercel-labs](https://github.com/vercel-labs/web-interface-guidelines) (MIT) et **figée au commit** plutôt que refetchée : une barre de jugement qui change sans qu'on le sache ne mesure rien. Elle est écrite pour du web — sur une autre cible, c'est ce fichier qu'il faut remplacer.

Les renvois sont à des sections, pas à des numéros de ligne : un doc qui cite une ligne ment dès la première réécriture du skill.

Le reste — le juge aveugle, `BACKLOG VIDE`, la règle du « vu tourner » — ne dépend d'aucune techno.

## Déploiement

Même code, deux presets :

- **quick** — Vercel + Postgres managé (Neon). `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` en variables d'env.
- **durable** — Coolify sur Hetzner. Coolify construit le `Dockerfile`, la DB est un service Postgres à côté.

Dans les deux cas, les seules variables à fournir sont `DATABASE_URL`, `BETTER_AUTH_SECRET` (un secret **distinct** de celui du dev) et `BETTER_AUTH_URL` (l'URL publique, en https).

**Les migrations n'ont pas d'étape manuelle** : `docker-entrypoint.sh` lance `migrate deploy` avant de démarrer le serveur. C'est idempotent, donc sans effet quand il n'y a rien à appliquer. Si la base est injoignable ou `DATABASE_URL` absent, le conteneur sort en code 1 plutôt que de servir des requêtes sur un schéma qui n'est pas celui du code.

## Conventions

Tout est dans [CLAUDE.md](CLAUDE.md). Les décisions techniques non évidentes sont tracées dans [DECISIONS.md](DECISIONS.md), une ligne chacune.

## D'où viennent les idées

Rien ici n'est figé, et rien n'est vraiment neuf. Le système bouge à chaque projet — ce qui est publié aujourd'hui ne ressemblera pas à ce qu'il sera dans deux mois. L'essentiel vient d'ailleurs :

- **La boucle qui relance l'agent jusqu'à épuisement du backlog** — le *Ralph Wiggum Loop* de [Geoffrey Huntley](https://github.com/ghuntley/how-to-ralph-wiggum). Le principe : réinjecter le même prompt à chaque tour, sans historique de conversation, et laisser l'état vivre dans les fichiers. Le plugin `ralph-loop` en vient, et `/slice` émet son signal d'arrêt dans le format qu'il attend. C'est aussi pourquoi une tranche livrée **sort** de `BACKLOG.md` avant de rendre la main : le backlog est la mémoire de la boucle — et une mémoire sans oubli finit par ne plus être consultable.
- **Le juge aveugle, qui ne valide que si le résultat tient face à une référence réelle** — le *Gauntlet Loop* de [Matt Shumer](https://x.com/mattshumer_/status/2081830214384886228), sorti de son projet « Claude of Duty » en juillet 2026. C'est de là que vient l'idée que le critique doit être un sous-agent distinct, privé du contexte de celui qui a produit, et jugeant contre un point de comparaison extérieur plutôt que contre les critères qu'on s'est écrits soi-même.

Ce qui est de nous : les avoir mis dans le même workflow, et les avoir passés sur de vrais outils plutôt que sur une démo.

## Pas de support

C'est un starter maison, publié parce qu'il peut servir — pas un projet communautaire. Il évolue selon nos besoins et peut casser sans préavis. Forke, adapte, garde ce qui te va. Les issues et PR ne seront pas forcément suivies : le meilleur usage de ce repo, c'est d'en prendre les idées.

MIT. Fais-en ce que tu veux.
