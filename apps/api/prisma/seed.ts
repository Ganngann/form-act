import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const formateur = await prisma.formateur.upsert({
    where: { email: 'jean.dupont@example.com' },
    update: {},
    create: {
      firstName: 'Jean',
      lastName: 'Dupont',
      email: 'jean.dupont@example.com',
    },
  });

  const formation = await prisma.formation.create({
    data: {
      title: 'Formation NestJS',
      description: 'Maîtriser le framework NestJS de A à Z.',
    },
  });

  console.log({ formateur, formation });
  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
