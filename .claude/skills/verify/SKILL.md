---
name: verify
description: Vérifie qu'une tranche marche vraiment — checks automatiques puis parcours réel dans l'app qui tourne. À faire avant de déclarer quoi que ce soit fini.
when_to_use: Avant de clore une tranche ou de committer, ou quand l'utilisateur demande si ça marche.
allowed-tools: Bash(npm run *) Bash(npx prisma *) Bash(docker compose *)
---

Un build vert ne prouve pas qu'un outil marche. Les deux étapes sont obligatoires.

## 1. Checks automatiques

```bash
npm run verify
```

Lint, typecheck et tests unitaires. Si ça échoue, corriger avant de continuer — ne pas passer à l'étape 2 avec du rouge.

## 2. Parcours réel

Lancer l'app et **constater** le critère de vérification de la tranche (dans `BACKLOG.md`) et le critère de réussite de `SPEC.md`.

- Postgres doit tourner : `docker compose up -d`
- Migrations à jour : `npx prisma migrate dev`
- Lancer l'app et piloter le navigateur soi-même, screenshot inclus. Ne pas demander à l'utilisateur de vérifier à sa place.
- Vérifier les logs serveur : une page qui s'affiche avec une erreur 500 en arrière-plan n'est pas verte.

Si le parcours touche l'authentification, le faire connecté **et** déconnecté — une route protégée qui répond sans session est un bug, pas un détail.

## 3. Rendre compte

Dire ce qui a été constaté, pas ce qui devrait marcher. Si une partie n'a pas pu être vérifiée, le dire explicitement plutôt que de la présenter comme validée.
