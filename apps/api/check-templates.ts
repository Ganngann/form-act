import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const count = await prisma.emailTemplate.count();
  console.log(`Total EmailTemplates: ${count}`);

  const templates = await prisma.emailTemplate.findMany();
  console.log(JSON.stringify(templates, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
