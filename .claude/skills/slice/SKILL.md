---
name: slice
description: Livre la prochaine tranche du BACKLOG de bout en bout — plan, test, implémentation, vérification réelle, commit. Conçu pour tourner en boucle sans intervention.
when_to_use: L'utilisateur dit "prochaine tranche", "continue", "implémente T2", ou lance une boucle de développement.
disallowed-tools: AskUserQuestion
---

Livrer **une seule** tranche, complètement. Ne pas en entamer une deuxième.

## 1. Choisir

D'abord `git status --porcelain BACKLOG.md`. S'il est sale, l'itération précédente est morte avant son commit : lire `git diff BACKLOG.md`, restaurer, et repartir de là. Une tranche livrée étant retirée du fichier, une itération interrompue peut avoir emporté une tranche sans avoir livré son code.

Lire `BACKLOG.md`. Prendre la première tranche de la section « Tranches », sauf si l'utilisateur en désigne une.

Si la section « Tranches » est vide : ne rien implémenter, s'arrêter, et écrire exactement ceci sur sa propre ligne — c'est le signal d'arrêt d'une boucle, dans la forme attendue par `ralph-loop` :

```
<promise>BACKLOG VIDE</promise>
```

Ne l'écrire que si c'est littéralement vrai. Jamais pour sortir d'une boucle où on se sent bloqué. Une réserve ou une ligne de « Capté en passant » n'est pas une tranche : le backlog peut être vide alors que le fichier ne l'est pas.

Si la tranche demande une action hors dépôt — un clic dans une console, un secret à poser, un arbitrage — ne rien implémenter : décrire exactement le geste attendu, puis passer à la première tranche implémentable en le disant. Ces tranches restent dans le fichier ; ce sont elles qui, sinon, finissent en réserves que personne ne voit.

Et s'il n'en reste aucune d'implémentable, s'arrêter en émettant le même signal, après avoir listé les gestes attendus. Il n'annonce pas que tout est livré : il dit qu'il n'y a plus rien à prendre sans intervention. Sans lui, la boucle reprendrait la même tranche et redirait la même chose à chaque tour.

## 2. Planifier

Lire `SPEC.md` et les fichiers concernés avant d'écrire quoi que ce soit. Si la tranche cite une spec (`docs/PRD.md:154`), aller lire **ces lignes** — pas le document entier. Poser le plan en tâches courtes avec les chemins de fichiers exacts. Le garder en tête, pas dans un fichier.

Si la tranche s'avère trop grosse pour un commit propre, la **remplacer** dans `BACKLOG.md` par ses deux moitiés — chacune portant ce qu'elle a besoin de savoir — et ne traiter que la première. La tranche d'origine sort du fichier comme n'importe quelle autre : pas de bloc de contexte qui survit à ses enfants.

## 3. Implémenter

Test d'abord quand le comportement est testable en unitaire : écrire le test, **le voir échouer**, puis écrire le minimum qui le fait passer. Un test qui passe du premier coup ne prouve rien — vérifier qu'il testait bien quelque chose.

Respecter « un seul chemin pour chaque chose » (CLAUDE.md). Ne pas introduire de dépendance nouvelle sans le dire explicitement dans le compte rendu.

**Si la tranche touche à l'écran**, lire d'abord la ligne de direction visuelle dans `DECISIONS.md` — elle sort de `/cadrage`. Puis charger `frontend-design` pour coder l'interface, en lui donnant cette direction comme contrainte : il exécute un parti pris déjà tranché, il n'en propose pas un autre. Ne pas rejouer le choix même s'il en suggère un meilleur — il retire un parti pris neuf à chaque génération, et deux tranches d'affilée ne doivent pas produire deux apparences.

Cas particulier : la ligne dit `À TRANCHER`, ou il n'y en a pas (cadrage sauté, projet antérieur à cette règle). Alors c'est cette tranche qui tranche — laisser `frontend-design` décider, écrire la ligne dans `DECISIONS.md`, poser les valeurs dans `src/app/globals.css`, et **le dire dans le compte rendu**. C'est une décision que l'utilisateur doit pouvoir contester tout de suite, pas trois tranches plus tard.

## 4. Vérifier

`npm run verify` doit passer. Puis suivre `/verify` : lancer l'app et constater le critère de vérification de la tranche. Aucune tranche n'est finie parce que le code compile.

Si ça ne passe pas : corriger et re-vérifier. Boucler au maximum trois fois sur le même échec ; au-delà, s'arrêter et rendre compte de ce qui bloque plutôt que d'empiler des tentatives.

## 5. Clore

Le tout dans **un seul commit**.

- **Retirer la tranche de `BACKLOG.md`** — pas la cocher, la supprimer
- Le constat de vérification dans `JOURNAL.md`, et là seulement
- Une ligne dans « Réserves » si c'est livré sans être prouvé, avec le fait qui la lèverait
- Une ligne dans « Capté en passant » pour ce qui a surgi et n'appartenait pas à la tranche
- Une ligne dans `DECISIONS.md` si un choix technique non évident a été fait
- Un commit `type(scope): description` dont le corps porte le constat

Rien de tout ça ne se recopie dans `BACKLOG.md` : c'est ainsi qu'il reste lisible au tour suivant.

## Compte rendu

Trois lignes, pas plus : ce qui est livré · comment ça a été vérifié · ce qui reste ou bloque. Ne pas déclarer fini ce qui n'a pas été vu tourner — dire ce qui a été sauté et pourquoi.
