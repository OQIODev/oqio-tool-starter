# WORKFLOW — quel skill, quand

Aide-mémoire. Si tu ne sais pas quoi lancer, la réponse est presque toujours dans le parcours ci-dessous.

## La règle en une phrase

**Cadrer une fois, trancher en boucle, vérifier avant de dire que c'est fini.**

Trois skills suffisent pour 95 % du travail : `/cadrage`, `/slice`, `/verify`. Le reste est du confort.

---

## Le parcours complet d'un outil

### 0. Créer le projet — depuis n'importe quelle session Claude Code

```
/nouvel-outil coach-sportif
```

Copie le starter, `git init`, génère le secret d'auth, installe les dépendances. Puis dans le Terminal, dans le nouveau dossier :

```bash
docker compose up -d
npx prisma migrate deploy
```

La migration des tables auth est déjà dans le starter — pas besoin d'en créer une. `migrate dev` ne sert que quand tu modifies `schema.prisma`.

Ouvre ensuite une session Claude Code **dans ce dossier**. Tout le reste s'y passe.

### 1. Cadrer — une seule fois

```
/cadrage
```

40 minutes de dialogue, une question à la fois. En sortie : `SPEC.md` (1-2 pages), `BACKLOG.md` (3 à 7 tranches), et **la direction visuelle de l'outil** — une ligne dans `DECISIONS.md`, les valeurs dans `globals.css`.

C'est le seul moment du projet où on parle d'apparence, et ça tient en trois questions : ce que l'outil doit dégager, une référence que tu aimes ou que tu refuses, clair/sombre et dense/aéré. Après, c'est écrit et tout s'y conforme. Si tu réponds vague, il écrit `À TRANCHER` plutôt que d'inventer.

La question qui compte : **à quoi tu verras que ça marche ?** Si tu ne sais pas y répondre, l'outil n'est pas prêt à être construit. Le skill insistera.

Ne saute pas cette étape en te disant que tu as l'idée en tête. Ce n'est pas pour toi que la spec est écrite, c'est pour l'agent — et pour toi dans trois semaines.

### 2. Construire — en boucle

```
/slice
```

Une tranche, de bout en bout : plan, test, code, vérification, commit. Puis tu relances. Et encore.

Quand tu veux que ça enchaîne sans toi :

```
/loop /slice
```

Natif, marche partout (app comme terminal). Sans intervalle, il s'auto-régule : il relance `/slice` quand le précédent a fini.

**`ralph-loop` ne marche que dans le terminal `claude`**, pas dans l'app — il fonctionne par un Stop hook qui intercepte la fin de session. Si tu es en terminal et que tu le veux :

```
/ralph-loop /slice --completion-promise "BACKLOG VIDE" --max-iterations 6
```

La promesse doit être émise par `/slice` sous la forme `<promise>BACKLOG VIDE</promise>` — c'est déjà le cas, ne change pas cette chaîne d'un côté sans l'autre.

À lancer quand le backlog est net et que tu vas faire autre chose. Mets toujours `--max-iterations` : à peu près le nombre de tranches restantes plus deux, jamais 50.

**Ce que boucle ralph, et ce qu'il oublie.** Il renvoie le *même prompt* à chaque tour, sans l'historique de conversation. Entre deux itérations, seuls survivent les fichiers et git. Une itération = un `/slice` = une tranche : il n'essaie pas de tout faire d'un coup, et il ne se souvient pas de ce qu'il a décidé au tour précédent.

C'est pour ça que `/slice` coche la tranche dans `BACKLOG.md` avant de rendre la main — **le backlog est la mémoire de la boucle.** L'itération suivante lit le fichier et sait où elle en est.

Deux conséquences :

- **Au début d'un projet, ralph ne sert à rien.** Backlog vide → `/slice` répond `BACKLOG VIDE` → la boucle s'arrête aussitôt. Fais `/cadrage` d'abord.
- **Ne boucle jamais sur une consigne vague** du type `/ralph-loop "construis l'outil"`. Sans backlog pour porter l'état, il redécide tout à chaque tour et tu récoltes des réécritures.

Et fais **la première tranche à la main**. C'est là qu'on voit si le découpage était juste. Si elle dérape, corrige le backlog avant de lancer la boucle — pas après six itérations.

**Aucune tranche ne décide de l'apparence** — la direction est tranchée au cadrage. Dès que la tranche touche à l'écran, `/slice` lit la ligne de `DECISIONS.md` et charge `frontend-design` avec, comme contrainte. Tu n'as rien à taper.

Ce que ce skill ne sait pas faire, c'est se souvenir : il retire un parti pris neuf à chaque génération. C'est `DECISIONS.md` qui porte la mémoire, exactement comme `BACKLOG.md` porte celle de la boucle. Si la ligne dit `À TRANCHER`, la tranche décide à sa place et **le dit dans son compte rendu** — c'est là que tu contestes, pas trois tranches plus tard.

### 3. Vérifier — avant de dire que c'est fini

```
/verify
```

`/slice` l'appelle déjà tout seul. Tu le lances à la main quand tu doutes, ou après avoir bricolé quelque chose toi-même.

Ce que ça fait : `npm run verify` (lint + types + tests), **puis** l'app lancée pour de vrai et le parcours constaté. Un build vert ne prouve rien.

Il a une troisième étape quand la tranche a touché à l'écran : il relit le code avec `web-design-guidelines` — accessibilité, navigation clavier, états de formulaire, contraste, `prefers-reduced-motion`, en `fichier:ligne`. Là non plus tu n'as rien à taper, c'est dans son `SKILL.md`. Un parcours qui aboutit ne prouve pas qu'il soit utilisable.

Pour la lancer seule, sur du code que tu as bricolé à la main :

```
/web-design-guidelines src/app/**/*.tsx
```

### 4. Nettoyer et livrer

| Besoin | Skill |
|---|---|
| Le code est correct mais moche | `/simplify` |
| Relire le diff avant de merger | `/code-review` |
| L'outil manipule des données perso | `/security-review` |

### 5. Déployer

Rien d'automatisé, c'est volontaire — deux presets, même code :

- **quick** : pousser sur Vercel, y mettre `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`
- **durable** : Coolify sur Hetzner construit le `Dockerfile`, Postgres à côté. Les migrations partent au démarrage du conteneur, il n'y a rien à lancer à la main

---

## Superpowers — tu ne l'appelles pas

Deux natures de skills, à ne pas confondre :

- **Les tiens** (`/cadrage`, `/slice`, `/verify`, `/nouvel-outil`) sont des **commandes**. Tu les tapes, il se passe quelque chose.
- **Ceux de superpowers** sont des **réflexes**. Leur description dit « Use when… » — Claude les charge tout seul au moment concerné. Il n'y a rien à taper, et c'est pour ça qu'ils n'apparaissent pas comme des étapes du parcours.

Où ils se réveillent, sans que tu demandes :

| Moment | Skill qui s'active |
|---|---|
| Tu décris une feature ou une idée | `brainstorming` |
| Il y a une spec et il faut un plan | `writing-plans` |
| L'implémentation commence | `test-driven-development` |
| Un test casse, un comportement surprend | `systematic-debugging` |
| Il s'apprête à dire « c'est fini » | `verification-before-completion` |
| Une tranche se termine | `requesting-code-review` |
| Travail parallèle sur plusieurs fichiers | `using-git-worktrees`, `subagent-driven-development` |
| Fin de branche, merge ou PR | `finishing-a-development-branch` |

`frontend-design` et `web-design-guidelines` sont d'une troisième nature : ce sont bien des réflexes, mais on ne compte pas sur le hasard pour qu'ils se réveillent — `/slice` et `/verify` les nomment explicitement dans leur `SKILL.md`. Rien à taper, et cette fois c'est garanti.

Tu peux forcer l'un d'eux à la main si tu veux, avec son nom complet :

```
/superpowers:brainstorming
```

```
/superpowers:systematic-debugging
```

**Le recouvrement, en clair.** Cette liste se superpose presque case pour case à `/slice` (plan → TDD → vérif → review) et à `/verify` (`verification-before-completion` fait le même travail). Ce n'est pas un autre moment du workflow, c'est la même zone couverte deux fois.

Donc : lance une tranche, observe qui prend la main, et garde un seul des deux. `/cadrage` reste à toi dans tous les cas — il porte ta façon de cadrer et le vocabulaire OQIO, ce que `brainstorming` ne connaît pas.

---

## Tableau de décision

| Ce que tu veux | Ce que tu lances |
|---|---|
| Démarrer un outil de zéro | `/nouvel-outil <nom>` |
| Transformer une idée en spec | `/cadrage` |
| Avancer sur le projet, sans plus de précision | `/slice` |
| Développer plusieurs tranches sans surveiller | `/loop /slice` |
| Idem, en terminal, avec un critère d'arrêt strict | `/ralph-loop` (terminal uniquement) |
| Arrêter une boucle ralph en cours | `/cancel-ralph` |
| Savoir si ça marche vraiment | `/verify` |
| Savoir si l'interface tient (a11y, clavier, contraste) | `/web-design-guidelines` |
| Voir l'app tourner | `/run` |
| Explorer une idée sans rien construire | `/superpowers:brainstorming` |
| Débugger un truc qui résiste | `/superpowers:systematic-debugging` |
| Nettoyer sans changer le comportement | `/simplify` |
| Relire avant merge | `/code-review` |
| Une idée hors sujet surgit | Rien — l'écrire dans `BACKLOG.md`, section « Capté en passant » |

---

## Quand ça déraille

**L'agent part dans tous les sens** → le backlog est trop grossier. Retour à `BACKLOG.md`, découpe la tranche en deux.

**Il déclare fini quelque chose qui ne marche pas** → tu as sauté `/verify`, ou le critère de vérification de la tranche n'était pas observable. Réécris le critère en quelque chose qu'on constate.

**Il réécrit du code qui marchait** → `CLAUDE.md` n'a pas été lu ou est contredit. Vérifie qu'il n'y a pas deux façons de faire la même chose dans le projet.

**Une boucle tourne dans le vide** → arrête-la. Le backlog est soit vide, soit mal écrit.

**Tu ne sais plus où en est le projet** → `BACKLOG.md` est l'état d'avancement. Les tranches cochées sont faites, le reste non.

---

## Les pièges

1. **Ne cumule pas deux méthodologies.** Si tu installes `superpowers`, ses `writing-plans` / `executing-plans` / `test-driven-development` recouvrent `/slice`. Garde-en un.
2. **Ne collectionne pas les skills.** Chaque skill est du contexte à charger et une façon de faire de plus. Cinq skills que tu maîtrises battent trente que tu ne lances jamais.
3. **Ne teste pas une techno nouvelle dans un vrai projet.** Bac à sable séparé. Le starter n'absorbe que ce qui a survécu.
4. **Ne laisse pas la spec grossir.** Si `SPEC.md` dépasse deux pages, c'est que des décisions d'implémentation y ont glissé. Elles vont dans `DECISIONS.md`, ou nulle part.
5. **Ne saute pas les trois questions d'apparence du cadrage.** `frontend-design` retire un parti pris neuf à chaque génération — c'est son métier, et c'est un problème sur un backlog de six tranches. Sans la ligne de `DECISIONS.md` pour le contraindre, la tranche 5 ne ressemblera pas à la tranche 2, et tu ne le verras qu'à la fin.

---

## Commandes shell utiles

```bash
npm run dev              # Dev sur le port 3000
npm run verify           # lint + types + tests — avant tout commit
npm run build            # Build production
docker compose up -d     # Postgres local
npx prisma migrate dev   # Nouvelle migration
npx prisma studio        # Voir la base
```
