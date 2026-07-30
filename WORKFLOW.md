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

40 minutes de dialogue, une question à la fois. En sortie : `SPEC.md` (1-2 pages) et `BACKLOG.md` (3 à 7 tranches).

La question qui compte : **à quoi tu verras que ça marche ?** Si tu ne sais pas y répondre, l'outil n'est pas prêt à être construit. Le skill insistera.

Ne saute pas cette étape en te disant que tu as l'idée en tête. Ce n'est pas pour toi que la spec est écrite, c'est pour l'agent — et pour toi dans trois semaines.

### 2. Construire — en boucle

```
/slice
```

Une tranche, de bout en bout : plan, test, code, vérification, commit. Puis tu relances. Et encore.

Quand tu veux que ça enchaîne sans toi, deux options :

```
/loop /slice
```

```
/ralph-loop /slice --completion-promise "BACKLOG VIDE" --max-iterations 10
```

`/loop` relance simplement. `/ralph-loop` renvoie le même prompt en boucle et refuse de sortir avant que la promesse de complétion soit vraie — plus têtu, donc mieux pour un backlog long, et c'est exactement pour ça que `/slice` termine sur `BACKLOG VIDE`.

À lancer quand le backlog est net et que tu vas faire autre chose. À **ne pas** lancer sur un backlog vague — une boucle sans critère d'arrêt clair produit du code plausible et faux. Mets toujours `--max-iterations`.

### 3. Vérifier — avant de dire que c'est fini

```
/verify
```

`/slice` l'appelle déjà tout seul. Tu le lances à la main quand tu doutes, ou après avoir bricolé quelque chose toi-même.

Ce que ça fait : `npm run verify` (lint + types + tests), **puis** l'app lancée pour de vrai et le parcours constaté. Un build vert ne prouve rien.

### 4. Nettoyer et livrer

| Besoin | Skill |
|---|---|
| Le code est correct mais moche | `/simplify` |
| Relire le diff avant de merger | `/code-review` |
| L'outil manipule des données perso | `/security-review` |

### 5. Déployer

Rien d'automatisé, c'est volontaire — deux presets, même code :

- **quick** : pousser sur Vercel, y mettre `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`
- **durable** : Coolify sur Hetzner construit le `Dockerfile`, Postgres à côté, `npx prisma migrate deploy` au déploiement

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
| Développer plusieurs tranches sans surveiller | `/loop /slice` ou `/ralph-loop` |
| Arrêter une boucle en cours | `/cancel-ralph` |
| Savoir si ça marche vraiment | `/verify` |
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
