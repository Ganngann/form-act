#!/bin/bash
set -e

echo "🚀 Initializing Form-Act Project..."

# 1. Install Dependencies
echo "📦 Installing dependencies..."
pnpm install

# 2. Generate Prisma Client
echo "🧱 Generating Prisma Client..."
cd apps/api
npx prisma generate
cd ../..

# 3. Push Schema to DB
echo "💾 Pushing schema to SQLite..."
cd apps/api
npx prisma db push
cd ../..

# 4. Seed Database (Optional for now)
if [ -f "apps/api/prisma/seed.ts" ]; then
    echo "🌱 Seeding database..."
    # Add seed command here if needed
fi

echo "✅ Project initialized successfully!"
