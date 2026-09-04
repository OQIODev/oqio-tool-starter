---
name: cadrage
description: Transforme une idée d'outil en SPEC.md, BACKLOG.md et CONTEXT.md, par dialogue. À lancer une fois au début d'un projet, avant d'écrire du code.
disable-model-invocation: true
---

Objectif : sortir de ce cadrage avec un `SPEC.md` d'une à deux pages, un `BACKLOG.md` de tranches verticales et un `CONTEXT.md` qui fixe le vocabulaire. Rien de plus. Viser 30 à 45 minutes.

## Mode de travail : par rounds

Le cadrage est un **arbre** : chaque décision ouvre celles qui en dépendent. Le **frontier**, c'est l'ensemble des questions dont les prérequis sont déjà tranchés — celles qu'on peut poser maintenant sans deviner une réponse qu'on n'a pas entendue.

Poser **tout le frontier en un round**, puis attendre. Une question dont la réponse dépend d'une autre question encore ouverte appartient au round suivant, pas à celui-ci. Chaque réponse redessine l'arbre : recalculer le frontier, poser le round suivant.

Format d'un round :

```
**Q1 — Le geste pénible** : [question, éventuellement avec des options]

→ Recommandation : [ta réponse, celle que tu défendrais]

**Q2 — Le critère de réussite** : [...]

→ Recommandation : [...]
```

La recommandation n'est pas décorative : elle donne quelque chose à **contredire**, ce qui est beaucoup plus rapide que de produire une réponse à froid. Si tu n'as pas d'avis défendable sur une question, ne pose pas de recommandation — dis que tu n'en as pas.

**Trouver les faits est ton travail, jamais celui de l'utilisateur.** Une question qui a besoin d'un fait de l'environnement (un fichier, une API, un prix, un état du dépôt) part dans un sous-agent. Ne pas bloquer le round dessus : seules les questions en aval de ce fait attendent, le reste du frontier se pose tout de suite.

Reformuler en une phrase après chaque réponse — c'est là que les malentendus se voient. Si une réponse est floue, le dire et redemander. Ne jamais combler un trou par de l'invention : écrire `À TRANCHER`.

**Fini quand le frontier est vide** : plus une seule question ouverte sur les six axes ci-dessous. Pas quand on en a assez, pas quand ça fait 40 minutes.

## Les six axes

Ce sont les branches de l'arbre. Chacune est tranchée ou porte un `À TRANCHER` explicite.

1. **Le problème réel** — ce qui coince aujourd'hui, concrètement, pas la solution rêvée. Si la réponse décrit déjà une interface, revenir en arrière : quel geste est pénible aujourd'hui ?
2. **Le critère de réussite vérifiable** — la question la plus importante du cadrage. « À quoi tu verras que ça marche ? » Refuser tout critère non constatable (« agréable », « fluide », « utile »). Reformuler en quelque chose qu'on observe dans l'app qui tourne.
3. **Le hors-périmètre** — « qu'est-ce qu'on ne fait pas, même si c'est tentant ? » Insister : une spec sans hors-périmètre dérive toujours.
4. **Le preset de déploiement** — `quick` (Vercel + Postgres managé) ou `durable` (Docker → Coolify/Hetzner). Une question, pas une phase d'architecture.
5. **Les contraintes qui changent le code** — données sensibles, jobs longs ou streaming IA, usage mobile, offline. Seulement celles-là.
6. **La direction visuelle** — trois questions, et c'est le seul moment du projet où on en parle. Après, elle est écrite et tout s'y conforme.
   - « Quelqu'un qui ouvre cet outil pour la première fois, il doit ressentir quoi ? » Refuser « moderne », « clean », « épuré » exactement comme on refuse « agréable » pour le critère de réussite : ça ne tranche rien. Chercher ce qui **exclut** — sobre comme un carnet, dense comme un tableau de bord, chaleureux, clinique.
   - « Une référence que tu aimes, ou une que tu refuses. » Un refus vaut autant qu'un goût, souvent mieux. Insister pour qu'elle soit **nommée** — un produit, un site, un objet précis. Elle servira deux fois : à générer l'interface, puis à la juger. « Quelque chose de sobre » ne peut pas servir de barre.
   - « Clair, sombre, ou les deux ? Plutôt dense ou plutôt aéré ? »

   Ne pas supposer une identité OQIO : certains outils sont hors de ce périmètre. La direction est celle de cet outil-là.

Ne pas demander : la stack (elle est figée, voir CLAUDE.md), le modèle de données, la liste des écrans et leur contenu, les user stories.

## Le vocabulaire

Pendant le dialogue, relever les mots que l'utilisateur emploie pour parler de son domaine — et surtout ceux qui font double emploi. Un mot qui désigne deux choses est la première cause de code qui part de travers.

Les poser dans `CONTEXT.md` en suivant son template : le terme, sa définition en une phrase, et les synonymes à **ne pas** employer. Trois à six termes suffisent au cadrage ; les tranches l'enrichiront.

## Découper le backlog

Des tranches **verticales** : chacune traverse la stack et se termine par quelque chose d'utilisable. Une tranche qui ne se voit pas tourner n'est pas une tranche.

- Bon : « saisir une séance et la revoir dans la liste »
- Mauvais : « créer les modèles Prisma », « faire le layout »

Viser 3 à 7 tranches pour une v1. La première doit être la plus petite chose qui prouve que l'idée tient debout. Chaque tranche porte un critère de vérification observable.

## Sortie

Écrire `SPEC.md`, `BACKLOG.md` et `CONTEXT.md` en suivant leurs templates.

`SPEC.md` ne parle que d'intention — le problème, le critère, le périmètre. Jamais de chemin de fichier, de nom de composant ni de schéma : ça périme en trois tranches, et une spec qui contredit le code est une deuxième source de vérité. Ce qui décrit une implémentation va dans `DECISIONS.md`.

Puis la direction visuelle, aux deux seuls endroits où elle vit :

- une ligne dans `DECISIONS.md` — ce qui est retenu, **ce qui est exclu** (c'est l'exclusion qui tient dans le temps), et **la référence nommée** suivie de `aimée` ou `refusée`. Cette référence n'est pas décorative : c'est la barre contre laquelle `/verify` juge l'interface. Sans elle, chaque tranche n'est comparée qu'à elle-même.
- les valeurs correspondantes dans `src/app/globals.css` (`--font-*`, `--color-*`)

Si les réponses sont restées vagues, ne rien inventer : écrire `À TRANCHER` dans `DECISIONS.md` et laisser la première tranche d'interface décider. Une direction floue posée en dur est pire qu'une absence de direction.

Puis s'arrêter — ne pas enchaîner sur du code. Dire à l'utilisateur qu'il peut lancer `/slice` quand il veut démarrer.
