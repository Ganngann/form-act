import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding ...');

  // Zones
  const zonesData = [
    { name: 'Bruxelles', code: 'BRU' },
    { name: 'Brabant Wallon', code: 'BW' },
    { name: 'Liège', code: 'LIE' },
    { name: 'Namur', code: 'NAM' },
    { name: 'Hainaut', code: 'HAI' },
    { name: 'Luxembourg', code: 'LUX' },
    { name: 'Anvers', code: 'ANT' },
    { name: 'Limbourg', code: 'LIM' },
    { name: 'Brabant Flamand', code: 'VBR' },
    { name: 'Flandre Occidentale', code: 'WVL' },
    { name: 'Flandre Orientale', code: 'OVL' },
  ];

  const zones = [];
  for (const z of zonesData) {
    const zone = await prisma.zone.upsert({
      where: { code: z.code },
      update: {},
      create: z,
    });
    zones.push(zone);
  }

  // Expertises
  const expertisesData = ['Bureautique', 'Management', 'Vente', 'NestJS'];
  const expertises = [];
  for (const e of expertisesData) {
    const exp = await prisma.expertise.upsert({
      where: { name: e },
      update: {},
      create: { name: e },
    });
    expertises.push(exp);
  }

  // Formateur
  const formateur = await prisma.formateur.upsert({
    where: { email: 'jean.dupont@example.com' },
    update: {
       predilectionZones: {
         set: [{ code: 'BRU' }, { code: 'BW' }]
       },
       expertiseZones: {
         set: [{ code: 'BRU' }, { code: 'BW' }, { code: 'LIE' }, { code: 'NAM' }]
       },
       expertises: {
         set: [{ name: 'NestJS' }, { name: 'Bureautique' }]
       }
    },
    create: {
      firstName: 'Jean',
      lastName: 'Dupont',
      email: 'jean.dupont@example.com',
      predilectionZones: {
        connect: [{ code: 'BRU' }, { code: 'BW' }]
      },
      expertiseZones: {
        connect: [{ code: 'BRU' }, { code: 'BW' }, { code: 'LIE' }, { code: 'NAM' }]
      },
      expertises: {
        connect: [{ name: 'NestJS' }, { name: 'Bureautique' }]
      }
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
        duration: '2 jours',
        expertise: {
          connect: { name: 'NestJS' },
        },
      },
    });
  } else {
    // Update existing if needed (e.g. if duration was missing)
    await prisma.formation.update({
      where: { id: formation.id },
      data: {
        duration: '2 jours',
        expertise: {
            connect: { name: 'NestJS' },
        },
      }
    });
  }

  // Management Formation
  const managementTitle = 'Management 101';
  await prisma.formation.upsert({
      where: { id: 'management-101' }, // Use a deterministic ID or find by something else? schema says ID is uuid. Best to findFirst.
      update: {},
      create: {
          title: managementTitle,
          description: 'Basics of Team Management',
          level: 'Beginner',
          duration: '1 jour',
          expertise: {
              connect: { name: 'Management' }
          }
      }
  });
  // Since we don't have unique constraint on Title, upsert by ID is tricky if we don't know it.
  // Better pattern for seed:
  const mgtFormation = await prisma.formation.findFirst({ where: { title: managementTitle } });
  if (!mgtFormation) {
      await prisma.formation.create({
          data: {
              title: managementTitle,
              description: 'Basics of Team Management',
              level: 'Beginner',
              duration: '1 jour',
              expertise: {
                  connect: { name: 'Management' }
              }
          }
      });
  }

  // Excel (Bureautique)
  const excelTitle = 'Excel Basics';
  const excelFormation = await prisma.formation.findFirst({ where: { title: excelTitle } });
  if (!excelFormation) {
      await prisma.formation.create({
          data: {
              title: excelTitle,
              description: 'Spreadsheets for everyone',
              level: 'Beginner',
              duration: '3 jours',
              expertise: {
                  connect: { name: 'Bureautique' }
              }
          }
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
