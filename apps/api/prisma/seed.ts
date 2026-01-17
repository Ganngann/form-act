import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding ...');

  const formateur = await prisma.formateur.upsert({
    where: { email: 'jean.dupont@example.com' },
    update: {},
    create: {
      firstName: 'Jean',
      lastName: 'Dupont',
      email: 'jean.dupont@example.com',
    },
  });

  const formationTitle = 'Introduction to NestJS';
  let formation = await prisma.formation.findFirst({
    where: { title: formationTitle },
  });

  if (!formation) {
    formation = await prisma.formation.create({
      data: {
        title: formationTitle,
        description: 'Learn the basics of NestJS framework.',
        level: 'Beginner',
      },
    });
  }

  console.log({ formateur, formation });
  console.log('Seeding finished.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
