#!/usr/bin/env sh
# backend/entrypoint.sh

# Exit on errors
set -e

# Apply any pending migrations
echo ">>> Applying database migrations..."
flask db upgrade

# Now exec whatever was passed as CMD
exec "$@"
