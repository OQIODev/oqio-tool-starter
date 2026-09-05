---
name: verify
description: Vérifie qu'une tranche marche vraiment — checks automatiques puis parcours réel dans l'app qui tourne, constaté par un tiers. Use when l'utilisateur demande si ça marche, avant de clore une tranche, ou avant un commit.
allowed-tools: Read Grep Glob Edit Write Bash(npm run *) Bash(npx prisma *) Bash(docker compose *) Bash(git *) Agent
---

Un build vert ne prouve pas qu'un outil marche. Les étapes 1 à 3 sont obligatoires ; la 4 l'est dès que la tranche a touché à l'écran.

## 1. Épingler le point fixe

Avant de lancer quoi que ce soit, savoir exactement ce qu'on vérifie et contre quoi :

- **Le critère**, recopié **mot pour mot** depuis la tranche dans `BACKLOG.md`, plus le critère de réussite de `SPEC.md`. Pas reformulé — recopié.
- **Le diff**, depuis le dernier commit : `git diff HEAD --stat` et `git status --porcelain`. Si le diff est vide, il n'y a rien à vérifier — le dire et s'arrêter là.
- **La ligne de direction visuelle** de `DECISIONS.md`, si la tranche a touché à l'écran.

Un point fixe qui ne résout pas, un critère absent ou un diff vide doivent échouer **ici**, pas dans un sous-agent lancé pour rien.

## 2. Checks automatiques

```bash
npm run verify
```

Lint, typecheck et tests unitaires. Si ça échoue, corriger avant de continuer — ne pas passer à l'étape 3 avec du rouge.

## 3. Parcours réel — constaté par quelqu'un d'autre

Celui qui a écrit le code ne constate pas son propre critère. Il sait ce qu'il a voulu faire, et il reconnaît son intention au lieu de regarder l'écran. Le parcours est donc confié à un sous-agent en contexte frais.

Préparer l'infrastructure, et rien de plus :

- Postgres doit tourner : `docker compose up -d`
- Migrations à jour : `npx prisma migrate dev`
- **Ne pas lancer l'app soi-même** — c'est le sous-agent qui la lance, et Next refuse un second serveur de dev sur le même dossier.

Puis lancer un sous-agent `general-purpose` dont le prompt contient :

- le critère et le critère de réussite, tels qu'épinglés à l'étape 1
- la consigne de lancer l'app et de piloter le navigateur lui-même, screenshot inclus
- l'obligation de s'assurer que le serveur qu'il pilote est bien **celui de ce dossier** avant de constater quoi que ce soit — un dev server d'un autre projet sur le même port donne un faux verdict dans les deux sens, et il est aveugle au code, donc rien ne le lui signalera
- l'interdiction de lire le diff, le dernier commit, le plan ou le compte rendu — il constate ce qu'il voit à l'écran, pas ce que le code prétend faire
- l'interdiction de corriger quoi que ce soit : il constate, il ne répare pas
- l'obligation de regarder les logs serveur — une page qui s'affiche avec une erreur 500 derrière n'est pas verte
- si le parcours touche l'authentification : le faire connecté **et** déconnecté, une route protégée qui répond sans session est un bug, pas un détail
- **si la tranche a touché à l'écran** : la ligne de direction visuelle, et la question « ce qui est à l'écran tient-il à côté de cette référence, ou à distance de celle qui est refusée ? » Il répond par un constat et ce qui cloche, pas par une proposition de direction. S'il n'y a pas de référence, ou si la ligne dit `À TRANCHER`, sauter la comparaison — ne pas s'en inventer une.

Il rend un verdict et ce qu'il a vu : `CONSTATÉ` · `INFIRMÉ` + ce qui s'est passé à la place · `PAS PU CONSTATER` + ce qui a bloqué. Sans verdict, l'étape n'est pas faite — ne jamais la remplacer par « ça devrait marcher ».

Si le verdict est `INFIRMÉ` : corriger, puis relancer un sous-agent **neuf**. Jamais celui qui a vu la version cassée : il a déjà son opinion et il validera la correction sur parole. Trois tours au maximum sur le même échec, au-delà s'arrêter et rendre compte de ce qui bloque.

Ne pas demander à l'utilisateur de vérifier à sa place.

## 4. Relecture de l'interface

Seulement si la tranche a touché à l'écran — sinon passer directement à l'étape 5.

La barre est [`.claude/rules/web-interface-guidelines.md`](../../rules/web-interface-guidelines.md) : 17 catégories, une centaine de règles, figées dans le dépôt. La lire, l'appliquer aux fichiers modifiés par la tranche, et rendre les constats en `fichier:ligne` selon le format de sortie qu'elle décrit.

Elle est **locale et figée exprès** : la barre ne doit pas changer entre deux tranches sans qu'on l'ait voulu. Ne pas aller chercher une version fraîche en ligne pendant une vérification — le fichier porte sa commande de rafraîchissement, qui se lance sur intention et se relit en `git diff`. Les deux règles qui bordent son usage (le projet l'emporte, c'est un jugement jamais une violation dure) sont dans son en-tête.

Corriger ce qui est constaté et dans le périmètre de la tranche ; écrire le reste dans `BACKLOG.md`, section « Capté en passant ». Ne rien passer en silence.

Ce n'est pas une relecture de goût : la direction est déjà tranchée dans `DECISIONS.md`, cette étape la contrôle, elle ne la rediscute pas.

## 5. Rendre compte

Trois constats, **côte à côte et non fusionnés** :

- **Parcours** — le verdict du sous-agent, tel qu'il l'a rendu.
- **Utilisabilité** — ce que la relecture a trouvé, en `fichier:ligne`.
- **Tenue** — la comparaison à la référence nommée.

Ne pas les mélanger, ne pas les reclasser, ne pas en tirer un verdict unique. C'est le but de la séparation : un parcours qui aboutit ne prouve pas que ce soit utilisable, et une interface utilisable ne prouve pas qu'elle tienne. Un verdict global laisserait l'un des trois masquer les autres.

Dire ce qui a été constaté, pas ce qui devrait marcher. Si une partie n'a pas pu être vérifiée, le dire explicitement plutôt que de la présenter comme validée.

Le récit du constat va dans `JOURNAL.md` et dans le corps du commit — **jamais dans `BACKLOG.md`**, qui ne dit que ce qui reste à faire. Ce qui n'a pas pu être vérifié se pose en **une ligne** dans « Réserves », avec le fait qui la lèverait.
