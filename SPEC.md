# SPEC — [nom de l'outil]

> Template. Rempli par `/cadrage`. Cible : 1 à 2 pages, jamais plus.
> Si une section demande une réponse qu'on n'a pas, écrire `À TRANCHER` — ne pas inventer.

**Ce fichier ne se modifie plus après le cadrage**, à une exception près : retirer une ligne de « À trancher » quand elle a été tranchée. Tout ce qui change en route va dans `DECISIONS.md`.

La règle tient à ce que la spec ne contient **que de l'intention** : le problème, le critère, le périmètre. Rien qui décrive une implémentation — pas de chemin de fichier, pas de nom de composant, pas de schéma. Une intention ne périme pas ; une description du code périme en trois tranches, et devient alors une deuxième source de vérité qui contredit le dépôt. Une spec figée et datée est honnête. Une spec entretenue mentira toujours au code.

Le vocabulaire du domaine, lui, vit dans [CONTEXT.md](CONTEXT.md) et grossit avec le projet.

## Le problème
Une à trois phrases. Ce qui coince aujourd'hui, concrètement.

## Pour qui
Qui s'en sert, dans quel contexte, à quelle fréquence.

## Critère de réussite
Une phrase **vérifiable** — quelque chose qu'on peut constater, pas ressentir.
Exemple : « Je saisis ma séance en moins de 30 secondes et je vois ma charge de la semaine sans cliquer. »
Contre-exemple : « L'outil est agréable à utiliser. »

## Ce que l'outil fait
Liste courte de capacités, pas d'écrans. Ce que quelqu'un peut faire avec l'outil, formulé de son point de vue.

## Hors périmètre
Explicite. C'est la section qui protège le projet — ce qui est ici ne sera pas construit, même si c'est tentant.

## Contraintes
Déploiement (`quick` ou `durable`), données sensibles, coût, dépendances externes, offline, mobile.

## À trancher
Les questions ouvertes qui ne bloquent pas le démarrage. La seule section qui a le droit de rétrécir.
