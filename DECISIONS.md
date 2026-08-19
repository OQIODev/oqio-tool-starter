# DECISIONS

Une ligne par décision technique non évidente. Pas d'ADR formel — le but est qu'une session future ne re-litige pas un choix déjà fait.

Format : `AAAA-MM-JJ — décision — pourquoi`

Des décisions, pas des constats : ce qui a été vu tourner va dans [JOURNAL.md](JOURNAL.md). Ce fichier n'archive rien — il empêche de re-litiger.

La direction visuelle est une de ces lignes, avec une contrainte de plus : elle nomme ce qui est retenu, ce qui est exclu, et une **référence réelle** suivie de `aimée` ou `refusée`. C'est cette référence que `/verify` prend comme barre pour juger l'interface — une ligne sans référence laisse chaque tranche se comparer à elle-même.

- 2026-07-30 — Better Auth plutôt que Supabase Auth — users dans notre propre DB Prisma, donc identique sur Vercel et sur Hetzner. Coupe le dernier couplage à un provider.
- 2026-07-30 — `output: "standalone"` + Dockerfile dès le départ — le preset `durable` ne demande aucun changement de code.
- 2026-08-06 — le parcours réel de `/verify` est constaté par un sous-agent aveugle, et l'interface jugée contre une référence nommée — celui qui écrit le code reconnaît son intention au lieu de regarder l'écran, et une rubrique qu'on s'écrit à soi-même, on la passe toujours.
- 2026-08-19 — un port de dev fixe et distinct par projet, posé au scaffold, plutôt qu'`autoPort` — remplace la décision inverse du 2026-08-06. Elle protégeait le sous-agent aveugle de `/verify` d'un faux verdict rendu sur le dev server d'un autre projet, ce qu'un port propre au projet protège aussi bien. `autoPort` avait deux coûts : un serveur qui glisse sur 3001 sans le dire laisse `BETTER_AUTH_URL` sur 3000 — cookies et redirections cassés —, et un dev server par projet s'installe en silence là où un port occupé aurait posé la question de savoir lequel doit tourner.
- 2026-08-19 — rien ne survit à la session sans qu'on l'ait demandé : `test` en une passe et `test:watch` séparé, `restart: "no"` sur le compose de dev, `webServer` Playwright qui appelle `npx next dev` sans passer par le script du projet. Sur un Mac sans ventilateur, un watcher ou un conteneur oublié ne se voit pas dans la liste des process fautifs — il se voit au bridage thermique, des heures plus tard.
