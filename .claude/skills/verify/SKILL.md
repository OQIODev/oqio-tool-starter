---
name: verify
description: Vérifie qu'une tranche marche vraiment — checks automatiques puis parcours réel dans l'app qui tourne. À faire avant de déclarer quoi que ce soit fini.
when_to_use: Avant de clore une tranche ou de committer, ou quand l'utilisateur demande si ça marche.
allowed-tools: Bash(npm run *) Bash(npx prisma *) Bash(docker compose *) Skill WebFetch Agent
---

Un build vert ne prouve pas qu'un outil marche. Les étapes 1 et 2 sont obligatoires ; la 3 l'est dès que la tranche a touché à l'écran.

## 1. Checks automatiques

```bash
npm run verify
```

Lint, typecheck et tests unitaires. Si ça échoue, corriger avant de continuer — ne pas passer à l'étape 2 avec du rouge.

## 2. Parcours réel — constaté par quelqu'un d'autre

Celui qui a écrit le code ne constate pas son propre critère. Il sait ce qu'il a voulu faire, et il reconnaît son intention au lieu de regarder l'écran. Le parcours est donc confié à un sous-agent en contexte frais.

Préparer l'infrastructure, et rien de plus :

- Postgres doit tourner : `docker compose up -d`
- Migrations à jour : `npx prisma migrate dev`
- **Ne pas lancer l'app soi-même** — c'est le sous-agent qui la lance, et Next refuse un second serveur de dev sur le même dossier.

Puis lancer un sous-agent `general-purpose` dont le prompt contient :

- le critère de vérification de la tranche, recopié **mot pour mot** depuis `BACKLOG.md`, et le critère de réussite de `SPEC.md`
- la consigne de lancer l'app et de piloter le navigateur lui-même, screenshot inclus
- l'interdiction de lire le diff, le dernier commit, le plan ou le compte rendu — il constate ce qu'il voit à l'écran, pas ce que le code prétend faire
- l'interdiction de corriger quoi que ce soit : il constate, il ne répare pas
- l'obligation de regarder les logs serveur — une page qui s'affiche avec une erreur 500 derrière n'est pas verte
- si le parcours touche l'authentification : le faire connecté **et** déconnecté, une route protégée qui répond sans session est un bug, pas un détail

Il rend un verdict et ce qu'il a vu : `CONSTATÉ` · `INFIRMÉ` + ce qui s'est passé à la place · `PAS PU CONSTATER` + ce qui a bloqué. Sans verdict, l'étape n'est pas faite — ne jamais la remplacer par « ça devrait marcher ».

Si le verdict est `INFIRMÉ` : corriger, puis relancer un sous-agent **neuf**. Jamais celui qui a vu la version cassée : il a déjà son opinion et il validera la correction sur parole. Trois tours au maximum sur le même échec, au-delà s'arrêter et rendre compte de ce qui bloque.

Ne pas demander à l'utilisateur de vérifier à sa place.

## 3. Relecture de l'interface

Seulement si la tranche a touché à l'écran — sinon passer directement à l'étape 4.

Deux choses distinctes, à ne pas confondre.

**L'utilisabilité, avec le code sous les yeux.** Charger `web-design-guidelines` sur les fichiers modifiés par la tranche. Il va chercher les règles à jour et rend ses constats en `fichier:ligne` : accessibilité, navigation clavier, états de formulaire, contraste, `prefers-reduced-motion`.

**La tenue, sans le code.** Une interface jugée contre les seuls critères qu'on s'est écrits les passe toujours. La ligne de direction visuelle de `DECISIONS.md` nomme une référence réelle, aimée ou refusée — c'est elle la barre. La comparaison se fait à l'étape 2, en ajoutant au prompt du sous-agent : la ligne de direction visuelle, et la question « ce qui est à l'écran tient-il à côté de cette référence, ou à distance de celle qui est refusée ? ». Il répond par un constat et ce qui cloche, pas par une proposition de direction. S'il n'y a pas de référence, ou si la ligne dit `À TRANCHER`, sauter la comparaison — ne pas s'en inventer une.

Un parcours qui aboutit ne prouve pas qu'il soit utilisable, et une interface utilisable ne prouve pas qu'elle tienne. Corriger ce qui est constaté et dans le périmètre de la tranche ; écrire le reste dans `BACKLOG.md`, section « Capté en passant ». Ne rien passer en silence.

Ce n'est pas une relecture de goût : la direction est déjà tranchée dans `DECISIONS.md`, cette étape la contrôle, elle ne la rediscute pas.

## 4. Rendre compte

Dire ce qui a été constaté, pas ce qui devrait marcher. Si une partie n'a pas pu être vérifiée, le dire explicitement plutôt que de la présenter comme validée.
