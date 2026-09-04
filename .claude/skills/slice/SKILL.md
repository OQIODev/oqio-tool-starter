---
name: slice
description: Livre la prochaine tranche du BACKLOG de bout en bout — plan, test, implémentation, vérification réelle, commit. Conçu pour tourner en boucle sans intervention.
disable-model-invocation: true
disallowed-tools: AskUserQuestion
---

Livrer **une seule** tranche, complètement. Ne pas en entamer une deuxième.

Chaque étape porte sa condition de fin. Ne pas passer à la suivante avant de l'avoir remplie — une étape « à peu près faite » est ce qui produit une tranche déclarée finie qui ne marche pas.

## 1. Choisir

D'abord `git status --porcelain BACKLOG.md`. S'il est sale, l'itération précédente est morte avant son commit : lire `git diff BACKLOG.md`, restaurer, et repartir de là. Une tranche livrée étant retirée du fichier, une itération interrompue peut avoir emporté une tranche sans avoir livré son code.

Lire `BACKLOG.md`. Prendre la première tranche de la section « Tranches », sauf si l'utilisateur en désigne une.

Si la section « Tranches » est vide : ne rien implémenter, s'arrêter, et écrire exactement ceci sur sa propre ligne — c'est le signal d'arrêt d'une boucle, dans la forme attendue par `ralph-loop` :

```
<promise>BACKLOG VIDE</promise>
```

Cette chaîne est comparée **caractère par caractère** par le Stop hook de `ralph-loop` : une casse changée, un point ajouté, et la boucle ne s'arrête jamais — sans erreur, jusqu'à `--max-iterations`. Ne la modifier ici qu'en la modifiant aussi dans la commande.

Ne l'écrire que si c'est littéralement vrai. Jamais pour sortir d'une boucle où on se sent bloqué. Une réserve ou une ligne de « Capté en passant » n'est pas une tranche : le backlog peut être vide alors que le fichier ne l'est pas.

Une tranche qui porte une **marque d'abandon** (`⚠ Abandonné le …`) n'est pas prenable : une itération précédente s'y est cassée les dents. Ne pas la reprendre — c'est le seul garde-fou contre une boucle qui retente indéfiniment le même échec, chaque tour croyant démarrer proprement. La traiter comme les tranches ci-dessous : passer à la suivante en le disant, et si aucune n'est prenable, émettre le signal d'arrêt.

Si la tranche demande une action hors dépôt — un clic dans une console, un secret à poser, un arbitrage — ne rien implémenter : décrire exactement le geste attendu, puis passer à la première tranche implémentable en le disant. Ces tranches restent dans le fichier ; ce sont elles qui, sinon, finissent en réserves que personne ne voit.

Et s'il n'en reste aucune d'implémentable, s'arrêter en émettant le même signal, après avoir listé les gestes attendus. Il n'annonce pas que tout est livré : il dit qu'il n'y a plus rien à prendre sans intervention. Sans lui, la boucle reprendrait la même tranche et redirait la même chose à chaque tour.

**Fini quand** : une tranche est nommée, son critère de vérification est recopié **mot pour mot** depuis `BACKLOG.md`, et `git status --porcelain BACKLOG.md` est propre.

## 2. Planifier

Lire `SPEC.md`, `CONTEXT.md` et les fichiers concernés avant d'écrire quoi que ce soit. `CONTEXT.md` donne le vocabulaire : les noms de variables, de fonctions et de fichiers s'y conforment, on n'invente pas un synonyme. Si la tranche cite une spec (`docs/PRD.md:154`), aller lire **ces lignes** — pas le document entier. Poser le plan en tâches courtes avec les chemins de fichiers exacts. Le garder en tête, pas dans un fichier.

Si la tranche s'avère trop grosse pour un commit propre, la **remplacer** dans `BACKLOG.md` par ses deux moitiés — chacune portant ce qu'elle a besoin de savoir — et ne traiter que la première. La tranche d'origine sort du fichier comme n'importe quelle autre : pas de bloc de contexte qui survit à ses enfants.

**Fini quand** : chaque tâche du plan nomme les fichiers exacts qu'elle touche, et aucune n'attend une information pas encore lue.

## 3. Implémenter

Test d'abord dès que le comportement est testable en unitaire : écrire le test, **le voir échouer**, puis écrire le minimum qui le fait passer. Un test qui passe du premier coup ne prouve rien — vérifier qu'il testait bien quelque chose.

C'est une porte, pas un conseil : si tu te surprends à écrire l'implémentation d'un comportement testable avant d'avoir vu son test échouer, arrête et écris le test. C'est exactement l'échec que cette étape empêche.

Respecter « un seul chemin pour chaque chose » (CLAUDE.md). Ne pas introduire de dépendance nouvelle sans le dire explicitement dans le compte rendu. Si la tranche fait apparaître un mot de domaine qui n'est pas dans `CONTEXT.md`, l'y ajouter avec sa définition et ses synonymes interdits.

**Si la tranche touche à l'écran**, charger `/ecran`. Il lit lui-même la direction visuelle de `DECISIONS.md` et l'exécute — il n'en propose pas une autre, et c'est tout l'intérêt : deux tranches d'affilée ne doivent pas produire deux apparences. Ne pas rejouer le choix, même si une meilleure idée se présente en chemin ; elle va dans « Capté en passant ».

Si la ligne dit `À TRANCHER` ou n'existe pas, `/ecran` tranche, une seule fois et pour tout le projet, puis l'écrit. Reprendre son compte rendu dans le tien : c'est une décision que l'utilisateur doit pouvoir contester tout de suite, pas trois tranches plus tard.

**Fini quand** : `npm run verify` passe, et chaque comportement testable en unitaire a un test qu'on a vu échouer avant de le voir passer.

## 4. Vérifier

Suivre `/verify` : les checks automatiques, puis l'app lancée pour de vrai et le critère constaté par un sous-agent en contexte frais. Aucune tranche n'est finie parce que le code compile.

Si ça ne passe pas : corriger et re-vérifier. **Au deuxième échec sur le même symptôme**, ne pas tenter une troisième correction — charger `/debug`. Deux correctifs qui ratent au même endroit veulent dire qu'on ne sait pas encore pourquoi ça casse, et le troisième est un coup de dés. Si `/debug` rend la main sans cause trouvée, s'arrêter là.

Et avant de rendre la main, **écrire la marque d'abandon sur la tranche** dans `BACKLOG.md` — une ligne sous son critère :

```
  - ⚠ Abandonné le AAAA-MM-JJ — <le symptôme exact> ; <ce que /debug a éliminé>
```

C'est ce qui empêche la boucle de reprendre la même tranche au tour suivant. Sans cette marque, l'itération suivante relit un backlog inchangé, ne sait rien de l'échec, et refait exactement la même chose. Le seul fichier qui garde la mémoire d'une boucle, c'est `BACKLOG.md` : un échec qui n'y est pas écrit n'a pas eu lieu.

La marque se retire à la main, quand l'utilisateur a tranché ce qui bloquait.

**Fini quand** : un verdict `CONSTATÉ` a été rendu sur le critère recopié à l'étape 1, par quelqu'un qui n'a pas écrit le code. « Ça devrait marcher » n'est pas un verdict, un build vert non plus.

## 5. Clore

Le tout dans **un seul commit**.

- **Retirer la tranche de `BACKLOG.md`** — pas la cocher, la supprimer
- Le constat de vérification dans `JOURNAL.md`, et là seulement
- Une ligne dans « Réserves » si c'est livré sans être prouvé, avec le fait qui la lèverait — une **réserve** porte sur du code livré, une **marque d'abandon** sur une tranche qui ne l'est pas ; ne pas confondre les deux
- Une ligne dans « Capté en passant » pour ce qui a surgi et n'appartenait pas à la tranche
- Une ligne dans `DECISIONS.md` si un choix technique non évident a été fait
- Un commit `type(scope): description` dont le corps porte le constat

Rien de tout ça ne se recopie dans `BACKLOG.md` : c'est ainsi qu'il reste lisible au tour suivant.

**Fini quand** : la tranche a disparu de `BACKLOG.md`, le constat est dans `JOURNAL.md` et dans le corps du commit, et `git status --porcelain` est vide.

## Compte rendu

Trois lignes, pas plus : ce qui est livré · comment ça a été vérifié · ce qui reste ou bloque. Ne pas déclarer fini ce qui n'a pas été vu tourner — dire ce qui a été sauté et pourquoi.
