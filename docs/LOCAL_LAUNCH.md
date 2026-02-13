You can easily launch the project locally using the following command in your terminal:

```bash
pnpm start:windows
```

This script will automatically:

1. Install all dependencies (`pnpm install`)
2. Create the `.env` file if it doesn't exist
3. Generate the database client (Prisma)
4. Apply database migrations
5. Seed the database with test data
6. Start the development server (Frontend + Backend)

If you prefer to run steps manually:

1. `pnpm install`
2. `cd apps/api` then `pnpm prisma migrate dev` and `pnpm prisma db seed`
3. `cd ../..` (back to root)
4. `pnpm dev`
