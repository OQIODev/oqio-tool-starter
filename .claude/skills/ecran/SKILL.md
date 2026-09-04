---
name: ecran
description: Code une interface en exécutant la direction visuelle déjà tranchée du projet. Use when une tranche touche à l'écran, ou l'utilisateur demande de construire une page, un composant, un formulaire, une vue.
allowed-tools: Read Grep Glob Edit Write Bash(npm run *)
---

**Ce skill n'a pas de goût.** Il exécute un parti pris tranché ailleurs — au cadrage, une fois pour tout le projet.

C'est ce qui le distingue d'un skill de design générique. Ceux-là sont écrits pour proposer une direction neuve et audacieuse à chaque génération, et certains l'ordonnent explicitement : « ne jamais converger, varier les polices et les thèmes d'une fois sur l'autre ». Excellent pour une maquette isolée. Ruineux sur un backlog de six tranches, où la tranche 5 ne ressemblerait pas à la tranche 2 et où personne ne le verrait avant la fin.

Ici, la variation est le défaut à éviter. La cohérence est le livrable.

## 1. Lire la direction — avant d'écrire une ligne

Trois sources, dans cet ordre :

- **La ligne de direction visuelle dans `DECISIONS.md`** — ce qui est retenu, ce qui est **exclu**, et la **référence nommée** suivie de `aimée` ou `refusée`. C'est l'exclusion qui tranche le plus : elle dit ce qu'on refuse même si c'est joli.
- **Les tokens `@theme` de `src/app/globals.css`** — `--font-*`, `--color-*`. Ce qui y est écrit est la palette du projet, pas une suggestion.
- **Les écrans déjà construits** — `src/app/` et `src/components/`. Une tranche d'interface ressemble à celles qui la précèdent. S'il y a un formulaire, le nouveau formulaire lui ressemble.

Cas particulier : la ligne dit `À TRANCHER`, ou il n'y en a pas. Alors **c'est cette tranche qui tranche**, une seule fois, et pour tout le projet. Choisir en partant du critère de réussite de `SPEC.md` et du contexte d'usage — pas d'un goût du jour. Puis écrire la ligne dans `DECISIONS.md`, poser les valeurs dans `globals.css`, et **le dire dans le compte rendu** : c'est une décision que l'utilisateur doit pouvoir contester tout de suite, pas trois tranches plus tard.

**Fini quand** la direction est citée mot pour mot dans le plan — ou écrite noir sur blanc si elle manquait.

## 2. Les cinq axes

Pour chacun, la question n'est jamais « qu'est-ce qui serait beau » mais **« qu'est-ce que cette direction impose ? »**. Un axe dont la réponse ne découle pas de la direction est un axe où on est en train de décider à sa place.

- **Typographie** — la famille vient de `--font-*`. Ce qui reste à décider est l'échelle : combien de tailles distinctes (trois suffisent presque toujours), quel écart entre elles, quelle graisse porte la hiérarchie. Une direction dense veut une échelle serrée ; une direction aérée veut du contraste.
- **Couleur** — les teintes viennent des tokens. Ce qui reste à décider est la **répartition** : quelle surface domine, où tombe le seul accent. Une palette où tout est réparti à parts égales n'a pas de direction, quelles que soient les couleurs.
- **Mouvement** — par défaut, rien. Une transition ne se justifie que si elle explique un changement d'état (ce qui apparaît, ce qui se réordonne). Toujours sous `prefers-reduced-motion`. Pas d'animation d'entrée décorative sur un outil qu'on ouvre vingt fois par jour.
- **Composition** — la densité vient de la direction (« dense comme un tableau de bord » ou « aéré comme un carnet »). Ce qui reste à décider est la structure de l'espace : une seule colonne de lecture, ou une grille ; où l'œil entre ; ce qui doit être atteignable sans défiler.
- **Matière** — bordures, ombres, fonds, contrastes de surface. Le levier le plus fort et le plus vite excessif : choisir **un** moyen de séparer les plans (une bordure fine, ou un décalage de fond, ou une ombre) et s'y tenir partout. Trois moyens mélangés, c'est du bruit.

## 3. Les interdits

Ils ne sont pas des questions de goût mais des marqueurs d'absence de décision. Dans cette stack, le piège n'est pas une police célèbre — ce sont **les valeurs par défaut de Tailwind**, qui produisent une apparence reconnaissable et anonyme :

- `bg-gray-*` / `text-gray-*` là où un token `--color-*` du projet devrait être — c'est la première cause d'un écran qui ne ressemble à rien
- `rounded-lg shadow-md` sur une carte centrée `max-w-md` : la mise en page par défaut de tout ce qui est généré sans direction
- un dégradé en fond sans raison, violet sur blanc en particulier
- trois colonnes égales pour trois éléments qui n'ont pas la même importance
- un emoji en guise d'icône dans une interface de production
- des tailles de police multipliées : cinq tailles pour trois niveaux d'information
- une police système par défaut alors que `--font-*` est défini

## 4. Un seul chemin

- Couleurs et typo : les tokens `@theme` de `globals.css`, **jamais une valeur en dur**
- Classes conditionnelles : `cn()` de `@/lib/utils/cn`
- `components/ui/` pour le générique shadcn, `components/features/` pour le métier
- Types partagés dans `src/types/`, jamais inline dans un composant
- Pas de `setState` dans un `useEffect` (React 19)

Un composant shadcn existant se réutilise et s'adapte par ses variantes. On ne le réécrit pas parce que la direction demande autre chose : on ajuste les tokens.

## 5. Rendre compte

Cinq lignes, une par axe : ce qui a été décidé, et de quelle partie de la direction ça découle. C'est ce qui permet à `/verify` de juger l'écran contre la référence nommée au lieu de le juger contre lui-même.

Si un axe a été tranché sans que la direction le dicte, le dire explicitement. C'est là que l'utilisateur reprend la main.

## Sources

Les cinq axes et la logique des interdits s'inspirent de deux références, réécrites ici pour cette stack et pour un usage inverse du leur — exécuter une direction plutôt qu'en proposer une neuve :

- `frontend-design` d'Anthropic ([Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0)), pour les axes et la notion d'esthétique générique à éviter
- les [Web Interface Guidelines](https://github.com/vercel-labs/web-interface-guidelines) de Vercel Labs (MIT), dont la copie figée dans [`.claude/rules/`](../../rules/web-interface-guidelines.md) sert de barre à `/verify`
