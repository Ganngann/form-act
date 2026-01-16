#!/bin/bash
set -e

echo "Initializing project..."

# Setup Environment Variables
if [ ! -f apps/api/.env ]; then
  echo "Creating apps/api/.env..."
  cp apps/api/.env.example apps/api/.env
fi

# Install dependencies
echo "Installing dependencies..."
pnpm install

# Generate Prisma Client
echo "Generating Prisma Client..."
pnpm --filter api exec prisma generate

# Push DB Schema
echo "Pushing DB Schema..."
pnpm --filter api exec prisma db push

# Seed Database
echo "Seeding Database..."
pnpm --filter api exec prisma db seed

echo "Project initialized successfully!"
