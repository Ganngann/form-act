#!/bin/bash
set -e

SCHEMA_FILE="apps/api/prisma/schema.prisma"

if [ "$1" == "sqlite" ]; then
    echo "🔄 Switching to SQLite..."
    sed -i 's/provider = "mysql"/provider = "sqlite"/' "$SCHEMA_FILE"
elif [ "$1" == "mysql" ]; then
    echo "🔄 Switching to MySQL (MariaDB)..."
    sed -i 's/provider = "sqlite"/provider = "mysql"/' "$SCHEMA_FILE"
else
    echo "❌ Usage: $0 [sqlite|mysql]"
    exit 1
fi

echo "✅ Switched provider to $1 in $SCHEMA_FILE"
