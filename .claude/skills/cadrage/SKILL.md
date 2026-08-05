---
name: cadrage
description: Transforme une idée d'outil en SPEC.md court et BACKLOG.md de tranches verticales, par dialogue. À lancer une fois au début d'un projet, avant d'écrire du code.
when_to_use: L'utilisateur décrit une idée d'outil, dit "on cadre", "prépare la spec", "j'ai une idée de", ou SPEC.md est encore le template vide.
---

Objectif : sortir de ce cadrage avec un `SPEC.md` d'une à deux pages et un `BACKLOG.md` de tranches verticales. Rien de plus. Viser 30 à 45 minutes de dialogue.

## Mode de travail

Dialogue, **une question à la fois**. Jamais de questionnaire en bloc. Après chaque réponse, reformuler en une phrase avant d'enchaîner — c'est là que les malentendus se voient.

Challenger avant de produire. Si une réponse est floue, le dire et redemander. Ne jamais combler un trou par de l'invention : écrire `À TRANCHER` dans la spec.

## Ce qu'il faut arracher

Dans cet ordre, en s'arrêtant dès qu'on a assez :

1. **Le problème réel** — ce qui coince aujourd'hui, concrètement, pas la solution rêvée. Si la réponse décrit déjà une interface, revenir en arrière : quel geste est pénible aujourd'hui ?
2. **Le critère de réussite vérifiable** — la question la plus importante du cadrage. « À quoi tu verras que ça marche ? » Refuser tout critère non constatable ("agréable", "fluide", "utile"). Reformuler en quelque chose qu'on peut observer dans l'app qui tourne.
3. **Le hors-périmètre** — « qu'est-ce qu'on ne fait pas, même si c'est tentant ? » Insister : une spec sans hors-périmètre dérive toujours.
4. **Le preset de déploiement** — `quick` (Vercel + Postgres managé) ou `durable` (Docker → Coolify/Hetzner). Une seule question, pas une phase d'architecture.
5. **Les contraintes qui changent le code** — données sensibles, jobs longs ou streaming IA, usage mobile, offline. Seulement celles-là.
6. **La direction visuelle** — trois questions, pas plus, et c'est le seul moment du projet où on en parle. Après, elle est écrite et tout s'y conforme.
   - « Quelqu'un qui ouvre cet outil pour la première fois, il doit ressentir quoi ? » Refuser « moderne », « clean », « épuré » exactement comme on refuse « agréable » pour le critère de réussite : ça ne tranche rien. Chercher ce qui **exclut** — sobre comme un carnet, dense comme un tableau de bord, chaleureux, clinique.
   - « Une référence que tu aimes, ou une que tu refuses. » Un refus vaut autant qu'un goût, souvent mieux.
   - « Clair, sombre, ou les deux ? Plutôt dense ou plutôt aéré ? » Une question, deux réponses courtes — c'est ce dont les tokens ont besoin.

   Ne pas supposer une identité OQIO : certains outils sont hors de ce périmètre. La direction est celle de cet outil-là.

Ne pas demander : la stack (elle est figée, voir CLAUDE.md), le modèle de données, la liste des écrans et leur contenu, les user stories.

## Découper le backlog

Des tranches **verticales** : chacune traverse la stack et se termine par quelque chose d'utilisable. Une tranche qui ne se voit pas tourner n'est pas une tranche.

- Bon : « saisir une séance et la revoir dans la liste »
- Mauvais : « créer les modèles Prisma », « faire le layout »

Viser 3 à 7 tranches pour une v1. La première doit être la plus petite chose qui prouve que l'idée tient debout. Chaque tranche porte un critère de vérification observable.

## Sortie

Écrire `SPEC.md` et `BACKLOG.md` en suivant leurs templates.

Puis la direction visuelle, aux deux seuls endroits où elle vit :

- une ligne dans `DECISIONS.md` — ce qui est retenu **et ce qui est exclu**, c'est l'exclusion qui tient dans le temps
- les valeurs correspondantes dans `src/app/globals.css` (`--font-*`, `--color-*`)

Si les réponses sont restées vagues, ne rien inventer : écrire `À TRANCHER` dans `DECISIONS.md` et laisser la première tranche d'interface décider. Une direction floue posée en dur est pire qu'une absence de direction.

Puis s'arrêter — ne pas enchaîner sur du code. Dire à l'utilisateur qu'il peut lancer `/slice` quand il veut démarrer.
