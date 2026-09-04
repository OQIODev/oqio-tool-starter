# CONTEXT — le vocabulaire de [nom de l'outil]

> Template. Amorcé par `/cadrage`, enrichi par les tranches au fil du projet.
> `/slice` le lit avant de planifier : les noms de variables, de fonctions et de fichiers se conforment à ces termes.

Ce fichier existe pour une raison précise : un agent lâché dans un projet devine le jargon au fur et à mesure, alors il emploie vingt mots là où un seul suffit — et deux tranches plus loin, la même chose porte trois noms différents dans le code. Un vocabulaire arrêté coûte trois lignes ici et se rembourse à chaque tranche.

Un terme entre dans ce fichier quand il désigne quelque chose de **ce domaine-là**. Pas de définition de `useState` ni de `Prisma` : ce que l'outil manipule, dans les mots de celui qui s'en sert.

## Termes

### [Terme]
Définition en une phrase, dans les mots de l'utilisateur.
**Pas :** les synonymes qu'on n'emploie pas — c'est cette ligne qui fait le travail. Sans elle, chaque tranche réinvente un mot voisin.

### [Terme]
...
**Pas :** ...

## Relations

Comment les termes se tiennent. Une ligne chacune.

- Un **[terme]** contient plusieurs **[terme]**
- Un **[terme]** porte un seul **[terme]** à la fois

## Ambiguïtés levées

Quand un mot désignait deux choses, ce qu'on a tranché. C'est la section qui empêche de retomber dans le même piège trois semaines plus tard.

- « [mot] » désignait à la fois [A] et [B]. Tranché : [A] est **[terme]**, [B] est **[terme]**, « [mot] » ne s'emploie plus.
