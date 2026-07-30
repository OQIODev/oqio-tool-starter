---
name: slice
description: Livre la prochaine tranche du BACKLOG de bout en bout — plan, test, implémentation, vérification réelle, commit. Conçu pour tourner en boucle sans intervention.
when_to_use: L'utilisateur dit "prochaine tranche", "continue", "implémente T2", ou lance une boucle de développement.
disallowed-tools: AskUserQuestion
---

Livrer **une seule** tranche, complètement. Ne pas en entamer une deuxième.

## 1. Choisir

Lire `BACKLOG.md`. Prendre la première tranche non cochée, sauf si l'utilisateur en désigne une.

Si toutes les tranches sont cochées : ne rien implémenter, écrire `BACKLOG VIDE` et s'arrêter. C'est le signal d'arrêt d'une boucle.

## 2. Planifier

Lire `SPEC.md` et les fichiers concernés avant d'écrire quoi que ce soit. Poser le plan en tâches courtes avec les chemins de fichiers exacts. Le garder en tête, pas dans un fichier.

Si la tranche s'avère trop grosse pour un commit propre, la scinder dans `BACKLOG.md` et ne traiter que la première moitié.

## 3. Implémenter

Test d'abord quand le comportement est testable en unitaire : écrire le test, **le voir échouer**, puis écrire le minimum qui le fait passer. Un test qui passe du premier coup ne prouve rien — vérifier qu'il testait bien quelque chose.

Respecter « un seul chemin pour chaque chose » (CLAUDE.md). Ne pas introduire de dépendance nouvelle sans le dire explicitement dans le compte rendu.

## 4. Vérifier

`npm run verify` doit passer. Puis suivre `/verify` : lancer l'app et constater le critère de vérification de la tranche. Aucune tranche n'est finie parce que le code compile.

Si ça ne passe pas : corriger et re-vérifier. Boucler au maximum trois fois sur le même échec ; au-delà, s'arrêter et rendre compte de ce qui bloque plutôt que d'empiler des tentatives.

## 5. Clore

- Cocher la tranche dans `BACKLOG.md`
- Ajouter dans « Capté en passant » ce qui a surgi et n'appartenait pas à la tranche
- Une ligne dans `DECISIONS.md` si un choix technique non évident a été fait
- Un commit : `type(scope): description`

## Compte rendu

Trois lignes, pas plus : ce qui est livré · comment ça a été vérifié · ce qui reste ou bloque. Ne pas déclarer fini ce qui n'a pas été vu tourner — dire ce qui a été sauté et pourquoi.
