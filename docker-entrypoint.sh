#!/bin/sh
# Applique les migrations, puis passe la main au serveur.
#
# Si les migrations échouent, le conteneur s'arrête : un déploiement en échec
# visible vaut mieux qu'une app qui sert des requêtes sur un schéma qui n'est
# pas celui du code.
#
# `migrate deploy` est idempotent — il n'applique que les migrations absentes.
# Il tourne donc à chaque démarrage sans dommage. Vrai pour une instance unique,
# ce qui est le cas ici ; plusieurs répliques démarrant ensemble se marcheraient
# sur les pieds.
set -e

# Format des logs aligné sur src/lib/utils/logger.ts — une ligne JSON par
# événement, pour que les logs Coolify restent lisibles d'un seul coup d'œil.
log() {
  echo "{\"level\":\"$1\",\"event\":\"$2\"}"
}

if [ -z "$DATABASE_URL" ]; then
  log error entrypoint.missing_database_url >&2
  exit 1
fi

log info entrypoint.migrate_start
# Sous-shell : le CLI a besoin de tourner dans `migrate/` (son arbre de
# dépendances et prisma.config.ts y sont), le serveur doit démarrer depuis /app.
(cd migrate && node node_modules/prisma/build/index.js migrate deploy)
log info entrypoint.migrate_done

exec "$@"
