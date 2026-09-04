# WORKFLOW — quel skill, quand

Aide-mémoire. Si tu ne sais pas quoi lancer, la réponse est dans le parcours ci-dessous.

## La règle en une phrase

**Cadrer une fois, trancher en boucle, vérifier avant de dire que c'est fini.**

Trois skills suffisent pour 95 % du travail : `/cadrage`, `/slice`, `/verify`. Le reste est du confort.

Ce sont des **commandes** : tu les tapes, il se passe quelque chose. Elles ne se déclenchent pas seules — c'est délibéré, voir `DECISIONS.md` au 2026-09-04. Seul `/verify` reste invocable par l'agent, parce que `/slice` l'appelle.

---

## Le parcours

### 0. Créer le projet

```bash
git clone https://github.com/OQIODev/oqio-tool-starter.git coach-sportif
cd coach-sportif && rm -rf .git && git init
npm install
cp .env.example .env.local       # remplir BETTER_AUTH_SECRET (openssl rand -base64 32)
docker compose up -d
npx prisma migrate deploy
```

Remplace le `name` dans `package.json`, et vide `DECISIONS.md` des lignes héritées du starter.

> Chez nous cette étape est une skill `/nouvel-outil`, câblée sur des chemins locaux — elle n'est pas dans le repo. Les commandes ci-dessus font le même travail, plus l'attribution des ports.

La migration des tables auth est déjà là. `migrate dev` ne sert que quand tu modifies `schema.prisma`.

Ouvre ensuite une session Claude Code **dans ce dossier**.

### 1. Cadrer — une seule fois

```
/cadrage
```

30 à 45 minutes, conduites par **rounds** : il pose d'un coup toutes les questions dont les prérequis sont tranchés, numérotées, chacune avec la réponse qu'il recommande. Tu réponds en un message — corriger une recommandation coûte moins que de produire une réponse à froid. Les faits qu'il peut aller chercher, il les cherche : il ne te demande pas ce qu'un sous-agent peut lire.

En sortie : `SPEC.md` (1-2 pages), `BACKLOG.md` (3 à 7 tranches), `CONTEXT.md` (le vocabulaire), et **la direction visuelle** — une ligne dans `DECISIONS.md`, les valeurs dans `globals.css`.

Deux questions portent tout le reste :

- **« À quoi tu verras que ça marche ? »** Si tu ne sais pas y répondre, l'outil n'est pas prêt à être construit.
- **La référence visuelle, nommée.** Un produit, un site, un objet précis, aimé ou refusé. Elle sert deux fois : à générer l'interface, puis à la juger en `/verify`. « Quelque chose de sobre » ne peut pas servir de barre.

Il s'arrête quand plus aucune question n'est ouverte, pas quand le temps est écoulé. Si tu réponds vague, il écrit `À TRANCHER` plutôt que d'inventer.

`SPEC.md` ne bouge plus après ça. Ce qui change en route va dans `DECISIONS.md` ; le vocabulaire, lui, grossit dans `CONTEXT.md` au fil des tranches.

### 2. Construire — en boucle

```
/slice
```

Une tranche de bout en bout : plan, test, code, vérification, commit. Chaque étape porte sa condition de fin — c'est ce qui empêche une tranche « à peu près finie ». L'étape test est une porte : pas de test rouge vu échouer, pas d'implémentation du comportement.

Pour enchaîner sans toi :

```
/loop /slice
```

Natif, marche partout. Sans intervalle, il relance `/slice` quand le précédent a fini.

En terminal uniquement, avec critère d'arrêt strict :

```
/ralph-loop /slice --completion-promise "BACKLOG VIDE" --max-iterations 6
```

Mets toujours `--max-iterations` : le nombre de tranches restantes plus deux, jamais 50. Et **fais la première tranche à la main** — c'est là qu'on voit si le découpage était juste. Si elle dérape, corrige le backlog avant de lancer la boucle, pas après six itérations.

Deux choses à savoir avant de boucler, détaillées dans `DECISIONS.md` : ralph réinjecte le prompt dans la **même** session (le contexte accumule), et c'est `BACKLOG.md` qui porte la mémoire de la boucle. Donc : jamais de boucle sur un backlog vide, jamais de boucle sur une consigne vague du type « construis l'outil ».

**Aucune tranche ne décide de l'apparence** — la direction est tranchée au cadrage, `/slice` la lit et contraint `frontend-design` avec. Tu n'as rien à taper. Si la ligne dit `À TRANCHER`, la tranche décide et **le dit dans son compte rendu** : c'est là que tu contestes.

### 3. Vérifier — avant de dire que c'est fini

```
/verify
```

`/slice` l'appelle déjà. Tu le lances à la main quand tu doutes, ou après avoir bricolé quelque chose toi-même.

Il épingle d'abord ce qu'il vérifie (le critère recopié mot pour mot, le diff), passe `npm run verify`, puis lance l'app pour de vrai. **Ce n'est pas celui qui a écrit le code qui constate** : le parcours part dans un sous-agent en contexte frais, qui reçoit le critère et rien d'autre — pas le diff, pas le plan. Il rend un verdict : constaté, infirmé, ou pas pu constater. Si c'est infirmé, la correction est jugée par un sous-agent **neuf**.

Il rend trois constats **séparés** : le parcours, l'utilisabilité (a11y, clavier, contraste, en `fichier:ligne`), et la tenue face à la référence nommée. Pas de verdict global — un parcours qui aboutit ne prouve pas que ce soit utilisable, et une interface utilisable ne prouve pas qu'elle tienne.

La barre d'utilisabilité est un fichier du dépôt, `.claude/rules/web-interface-guidelines.md` — 17 catégories reprises de Vercel, figées au commit. Elle ne se rafraîchit pas pendant une vérification : la commande est dans son en-tête, elle se lance sur intention et se relit en `git diff`. Une barre qui bouge sans qu'on le sache ne mesure rien.

### 4. Nettoyer et livrer

| Besoin | Skill |
|---|---|
| Le code est correct mais moche | `/simplify` |
| Relire le diff avant de merger | `/code-review` |
| L'outil manipule des données perso | `/security-review` |

### 5. Déployer

Rien d'automatisé, c'est volontaire — deux presets, même code :

- **quick** : pousser sur Vercel, y mettre `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`
- **durable** : Coolify sur Hetzner construit le `Dockerfile`, Postgres à côté. Les migrations partent au démarrage du conteneur

---

## superpowers est coupé

`.claude/settings.json` le désactive pour ce projet, et il est coupé globalement dans les settings user.

Ses 14 skills recouvraient notre chaîne case pour case (`brainstorming`↔`/cadrage`, `writing-plans` + `test-driven-development`↔`/slice`, `verification-before-completion`↔`/verify`), et son hook `SessionStart` ordonnait d'invoquer une skill avant toute réponse. Deux méthodologies pour le même travail, dont une qui gagnait toujours.

Pour le remettre le temps d'un essai : passer sa ligne à `true` dans `.claude/settings.json`. Ce qu'il faisait d'orthogonal (worktrees, sous-agents parallèles) est couvert par les outils natifs.

---

## Tableau de décision

| Ce que tu veux | Ce que tu lances |
|---|---|
| Démarrer un outil de zéro | `git clone` du starter (étape 0) |
| Transformer une idée en spec | `/cadrage` |
| Avancer sur le projet, sans plus de précision | `/slice` |
| Développer plusieurs tranches sans surveiller | `/loop /slice` |
| Idem, en terminal, avec critère d'arrêt strict | `/ralph-loop` (terminal uniquement) |
| Arrêter une boucle ralph en cours | `/cancel-ralph` |
| Savoir si ça marche vraiment | `/verify` |
| Savoir si l'interface tient (a11y, clavier, contraste) | `/verify` — il applique `.claude/rules/web-interface-guidelines.md` |
| Voir l'app tourner | `/run` |
| Nettoyer sans changer le comportement | `/simplify` |
| Relire avant merge | `/code-review` |
| Une idée hors sujet surgit | Rien — l'écrire dans `BACKLOG.md`, section « Capté en passant » |

---

## Quand ça déraille

**L'agent part dans tous les sens** → le backlog est trop grossier. Découpe la tranche en deux.

**Il déclare fini quelque chose qui ne marche pas** → tu as sauté `/verify`, ou le critère n'était pas observable. Réécris le critère en quelque chose qu'on constate.

**Il réécrit du code qui marchait** → `CLAUDE.md` n'a pas été lu ou est contredit. Vérifie qu'il n'y a pas deux façons de faire la même chose.

**Il emploie trois mots pour la même chose** → `CONTEXT.md` est vide ou incomplet. Le terme manquant y va, avec ses synonymes interdits.

**Une boucle tourne dans le vide** → arrête-la. Le backlog est soit vide, soit mal écrit.

**Tu ne sais plus où en est le projet** → `BACKLOG.md` dit ce qui reste, `git log --oneline` ce qui est fait, `JOURNAL.md` ce qu'on a vu tourner. Pour retrouver une tranche livrée avec son critère : `git log -p -- BACKLOG.md`.

**Tu ne sais plus ce qui est vraiment prouvé** → la section « Réserves » du backlog. C'est le seul endroit qui dit ce qui est livré sans avoir été constaté.

---

## Les pièges

1. **Ne cumule pas deux méthodologies.** C'est le piège dans lequel on est tombé pendant un mois. Voir la section superpowers.
2. **Ne collectionne pas les skills.** Chaque skill model-invocable est du contexte permanent et un concurrent de plus. Cinq skills que tu maîtrises battent trente que tu ne lances jamais.
3. **Ne laisse rien s'accumuler dans `BACKLOG.md`.** C'est le seul fichier que chaque itération relit en entier, et l'agent imite le format qu'il y trouve. Mesure et raison dans `DECISIONS.md`.
4. **Ne laisse pas la spec grossir — ni bouger.** Si `SPEC.md` dépasse deux pages, des décisions d'implémentation y ont glissé : elles vont dans `DECISIONS.md`. Et une fois le cadrage fini, elle ne se modifie plus.
5. **Ne saute pas les trois questions d'apparence du cadrage.** `frontend-design` retire un parti pris neuf à chaque génération. Sans la ligne de `DECISIONS.md`, la tranche 5 ne ressemblera pas à la tranche 2, et tu le verras à la fin.
6. **Ne teste pas une techno nouvelle dans un vrai projet.** Bac à sable séparé. Le starter n'absorbe que ce qui a survécu.
