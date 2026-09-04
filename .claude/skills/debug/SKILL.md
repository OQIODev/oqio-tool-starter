---
name: debug
description: Diagnostique un bug qui résiste — construit d'abord une commande qui passe au rouge, puis réduit, hypothétise, corrige et verrouille. Use when un test casse sans raison évidente, un comportement surprend, une correction a déjà échoué une fois, ou l'utilisateur dit « débugge », « ça plante », « pourquoi ça marche pas ».
allowed-tools: Read Grep Glob Edit Write Bash(npm *) Bash(npx *) Bash(docker compose *) Bash(git *) Bash(curl *) Bash(lsof *) Agent
---

Un bug qui résiste ne se résout pas en lisant du code. Il se résout en construisant une commande qui passe au **rouge** sur ce bug précis — après quoi tout le reste est mécanique.

Chaque phase porte sa condition de fin. La phase 1 est une porte : rien ne commence avant elle.

## 1. Une commande qui passe au rouge

**C'est tout le skill.** Avec un signal rouge/vert fiable, on trouve la cause ; sans, on peut fixer l'écran pendant une heure sans rien apprendre. Y mettre un effort disproportionné.

Les moyens dans ce projet, du plus serré au moins serré :

1. **Un test unitaire au bon seam** — `npx vitest run tests/unit/<nom>.test.ts`. Le plus serré : quelques centaines de millisecondes.
2. **Un test jetable qui reproduit** — écrire `tests/unit/repro.test.ts` qui appelle la fonction en isolation, sans passer par l'interface, et le lancer de la même façon. Vitest exécute déjà le TypeScript du projet : pas de runner à installer, et à la phase 5 ce fichier devient le test de régression au lieu d'être jeté.
3. **Un test d'intégration** contre le vrai Postgres — `npm run test:integration` (`tests/integration/`), base dédiée, jamais celle du dev. C'est le moyen pour tout ce qui touche Prisma ou une session.
4. **`curl` contre le dev server** qui tourne, en lisant **les logs serveur en même temps** — une page qui s'affiche avec une 500 derrière n'est pas verte.
5. **Playwright** — `npm run test:e2e` (`tests/e2e/`). En dernier recours : lent, et il faut arrêter `npm run dev` avant, Next refuse un second serveur de dev sur le même dossier.

Puis **serrer** la boucle : plus rapide (réduire la portée, couper l'init inutile), plus nette (asserter le symptôme exact, pas « ça ne plante pas »), plus déterministe (figer l'horodatage, semer l'aléatoire, isoler la base). Une boucle de 30 secondes qui flanche vaut à peine mieux que rien ; une boucle de 2 secondes déterministe est ce qui résout le bug.

Bug intermittent : l'objectif n'est pas un repro propre mais un **taux** exploitable. Boucler le déclencheur 100 fois, paralléliser, resserrer la fenêtre. Un bug qui tombe une fois sur deux se débugue ; une fois sur cent, non.

**Fini quand** on peut nommer **une commande**, **déjà lancée au moins une fois** (montrer l'invocation et sa sortie), qui coche les quatre :

- **Rouge sur *ce* bug** — elle reproduit le symptôme que l'utilisateur a décrit, pas un échec voisin qui traîne à côté. Mauvais bug, mauvais correctif.
- **Déterministe** — même verdict à chaque passage, ou un taux assez haut pour travailler.
- **Rapide** — des secondes, pas des minutes.
- **Autonome** — lançable sans qu'un humain clique.

Si tu te surprends à lire du code pour bâtir une théorie avant que cette commande existe, arrête : c'est exactement l'échec que ce skill empêche. Pas de commande rouge, pas de phase 2.

## 2. Réduire

La commande est rouge. Rétrécir le scénario au plus petit qui reste rouge : couper une entrée, un appelant, une option, une donnée, une étape — **une à la fois**, en relançant après chaque coupe.

Ça paie deux fois : moins de pièces mobiles à suspecter en phase 3, et le scénario réduit devient le test de régression en phase 5.

**Fini quand** chaque élément restant est porteur : en retirer n'importe lequel fait passer au vert.

## 3. Trois hypothèses, classées

En écrire **trois à cinq avant d'en tester une**. Une seule hypothèse s'ancre sur la première idée plausible et on passe l'heure suivante à la défendre.

Chacune doit être **falsifiable**, c'est-à-dire porter sa prédiction : « si c'est X, alors changer Y fait disparaître le symptôme ». Sans prédiction énonçable, c'est une intuition — l'aiguiser ou la jeter.

Montrer la liste classée à l'utilisateur avant de tester : il sait souvent reclasser en une seconde (« on vient de toucher au numéro 3 »). Ne pas bloquer dessus — s'il n'est pas là, avancer avec son propre classement.

**Fini quand** trois hypothèses au moins sont écrites, classées, chacune avec sa prédiction.

## 4. Instrumenter

Chaque sonde répond à une prédiction précise de la phase 3, et on ne change **qu'une variable à la fois**.

Préférer, dans l'ordre : l'inspection directe d'une valeur au bon endroit ; un log ciblé à la frontière qui sépare deux hypothèses ; et jamais « logger partout puis grep ».

**Taguer chaque log de debug** d'un préfixe unique — `[DEBUG-a4f2]`. Le nettoyage de la phase 6 devient un seul grep, et un log non tagué est un log qui survivra au commit.

**Fini quand** une hypothèse est confirmée par une observation, pas par un raisonnement.

## 5. Corriger et verrouiller

Écrire le test de régression **avant** le correctif — mais seulement s'il existe un **seam correct**, c'est-à-dire un endroit où le test exerce le vrai chemin du bug tel qu'il se produit à l'appel.

Si le seul seam disponible est trop superficiel pour ça, un test posé là donne une fausse confiance. **Alors l'absence de seam est elle-même le constat** : l'écrire dans `DECISIONS.md`, et une ligne dans « Capté en passant » de `BACKLOG.md`. C'est l'architecture qui empêche de verrouiller le bug, pas le bug qui résiste.

S'il y a un seam correct : transformer le scénario réduit en test — si le repro de la phase 1 était déjà un test jetable, le renommer et le garder plutôt que d'en écrire un second —, **le voir échouer**, appliquer le correctif, le voir passer. Puis relancer la commande de la phase 1 sur le scénario **d'origine**, pas seulement sur le réduit.

**Fini quand** la commande de la phase 1 est verte sur le scénario d'origine, et que le test de régression existe — ou que son impossibilité est écrite.

## 6. Nettoyer et rendre compte

- [ ] La commande de la phase 1 ne reproduit plus
- [ ] `npm run verify` passe
- [ ] Le test de régression passe, ou son absence est documentée
- [ ] `grep -rn "DEBUG-" src/` ne rend rien
- [ ] `tests/unit/repro.test.ts` a été promu en test de régression ou supprimé — jamais laissé tel quel
- [ ] **L'hypothèse qui s'est avérée juste est écrite dans le corps du commit** — c'est ce qui sert au prochain qui tombera dessus

Le compte rendu tient en trois lignes : le symptôme · la cause trouvée et comment elle a été confirmée · ce qui verrouille le bug maintenant. Si la cause n'a pas été trouvée, le dire — et dire ce qu'on a éliminé, ce qui a plus de valeur qu'une réparation au hasard.

## Les pièges de ce starter

Quatre causes reviennent, et aucune ne se voit en lisant le code fautif. Les écarter **avant** de suspecter la logique.

- **Une session qui ne s'ouvre jamais** — `BETTER_AUTH_URL` sur un autre port que le dev server. Les cookies sont posés sur la mauvaise origine. Comparer `.env.local` et le `--port` de `package.json` avant tout le reste.
- **Une colonne ou une table qui n'existe pas** — migration pas appliquée. `npx prisma migrate dev`, et vérifier que Postgres tourne (`docker compose up -d`).
- **Un verdict qui n'a aucun sens** — le serveur interrogé n'est peut-être pas celui de ce dossier. `lsof -i :<port>` : un dev server d'un autre projet répond de façon plausible et ne signale rien.
- **Une route protégée qui répond sans session** — ce n'est pas un bug du proxy. Le check de [`src/proxy.ts`](../../../src/proxy.ts) est **optimiste** par conception (présence de cookie, aucun accès base) ; c'est un `requireAuthUser()` manquant côté serveur.

## Quand la boucle rouge est impossible

Le dire explicitement et s'arrêter. Lister ce qui a été tenté et ce qui manque pour aller plus loin — un accès, un jeu de données, une trace capturée.

Ne pas passer à la phase 2 sans boucle : sans elle, une correction n'est qu'une supposition qu'on ne saura pas juger. Poser une ligne dans « Réserves » de `BACKLOG.md` avec le fait qui la lèverait, et rendre la main.

Cette règle compte double quand `/slice` tourne en boucle sans surveillance : une phase 1 qui n'aboutit pas doit rendre la main tout de suite, pas consommer la nuit à tester des hypothèses qu'aucun signal ne peut trancher.
