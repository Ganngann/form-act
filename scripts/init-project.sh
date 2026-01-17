#!/bin/bash
set -e

echo "🚀 Initializing Form-Act Project..."

# 1. Install Dependencies
echo "📦 Installing dependencies..."
pnpm install

# 2. Setup Environment
echo "⚙️ Setting up environment..."
if [ ! -f "apps/api/.env" ]; then
    cp apps/api/.env.example apps/api/.env
    echo "✅ apps/api/.env created from example."
else
    echo "ℹ️ apps/api/.env already exists."
fi

# 3. Generate Prisma Client
echo "🧱 Generating Prisma Client..."
cd apps/api
npx prisma generate
cd ../..

# 4. Push Schema to DB
echo "💾 Pushing schema to SQLite..."
cd apps/api
npx prisma db push
cd ../..

# 5. Seed Database
echo "🌱 Seeding database..."
cd apps/api
npx prisma db seed
cd ../..

echo "✅ Project initialized successfully!"
