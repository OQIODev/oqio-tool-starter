---
name: verify
description: Vérifie qu'une tranche marche vraiment — checks automatiques puis parcours réel dans l'app qui tourne. À faire avant de déclarer quoi que ce soit fini.
when_to_use: Avant de clore une tranche ou de committer, ou quand l'utilisateur demande si ça marche.
allowed-tools: Bash(npm run *) Bash(npx prisma *) Bash(docker compose *) Skill WebFetch
---

Un build vert ne prouve pas qu'un outil marche. Les étapes 1 et 2 sont obligatoires ; la 3 l'est dès que la tranche a touché à l'écran.

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

## 3. Relecture de l'interface

Seulement si la tranche a touché à l'écran — sinon passer directement à l'étape 4.

Charger `web-design-guidelines` sur les fichiers modifiés par la tranche. Il va chercher les règles à jour et rend ses constats en `fichier:ligne` : accessibilité, navigation clavier, états de formulaire, contraste, `prefers-reduced-motion`.

Un parcours qui aboutit ne prouve pas qu'il soit utilisable. Corriger ce qui est constaté et dans le périmètre de la tranche ; écrire le reste dans `BACKLOG.md`, section « Capté en passant ». Ne rien passer en silence.

Ce n'est pas une relecture de goût : la direction visuelle est déjà tranchée dans `DECISIONS.md`, cette étape ne la rediscute pas.

## 4. Rendre compte

Dire ce qui a été constaté, pas ce qui devrait marcher. Si une partie n'a pas pu être vérifiée, le dire explicitement plutôt que de la présenter comme validée.
