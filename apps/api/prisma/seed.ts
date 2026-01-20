import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

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

  // Categories
  const categoriesData = ['Bureautique', 'Management', 'Développement', 'Soft Skills'];
  const categories = [];
  for (const c of categoriesData) {
    const cat = await prisma.category.upsert({
      where: { name: c },
      update: {},
      create: { name: c },
    });
    categories.push(cat);
  }

  // Admin User
  const adminEmail = 'admin@formact.be';
  const hashedPassword = await bcrypt.hash('admin123', 10);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      role: 'ADMIN',
    },
    create: {
      email: adminEmail,
      name: 'Super Admin',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  // Formateur
  const formateurEmail = 'jean.dupont@example.com';
  // Ensure user exists for formateur
  const formateurUser = await prisma.user.upsert({
      where: { email: formateurEmail },
      update: { role: 'TRAINER' },
      create: {
          email: formateurEmail,
          name: 'Jean Dupont',
          password: hashedPassword, // Same password for testing
          role: 'TRAINER'
      }
  });

  const formateur = await prisma.formateur.upsert({
    where: { email: formateurEmail },
    update: {
       userId: formateurUser.id,
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
      email: formateurEmail,
      userId: formateurUser.id,
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
        durationType: 'FULL_DAY',
        expertise: {
          connect: { name: 'NestJS' },
        },
        category: {
          connect: { name: 'Développement' },
        }
      },
    });
  } else {
    // Update existing if needed (e.g. if duration was missing)
    await prisma.formation.update({
      where: { id: formation.id },
      data: {
        duration: '2 jours',
        durationType: 'FULL_DAY',
        expertise: {
            connect: { name: 'NestJS' },
        },
        category: {
          connect: { name: 'Développement' },
        }
      }
    });
  }

  // Management Formation
  const managementTitle = 'Management 101';
  await prisma.formation.upsert({
      where: { id: 'management-101' },
      update: {
        category: { connect: { name: 'Management' } }
      },
      create: {
          title: managementTitle,
          description: 'Basics of Team Management',
          level: 'Beginner',
          duration: '1 jour',
          expertise: {
              connect: { name: 'Management' }
          },
          category: { connect: { name: 'Management' } }
      }
  });

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
              },
              category: { connect: { name: 'Management' } }
          }
      });
  } else {
    await prisma.formation.update({
      where: { id: mgtFormation.id },
      data: {
        category: { connect: { name: 'Management' } }
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
              durationType: 'HALF_DAY',
              expertise: {
                  connect: { name: 'Bureautique' }
              },
              category: { connect: { name: 'Bureautique' } }
          }
      });
  } else {
    await prisma.formation.update({
      where: { id: excelFormation.id },
      data: {
        durationType: 'HALF_DAY',
        category: { connect: { name: 'Bureautique' } }
      }
    });
  }

  // Client
  const clientEmail = 'client@company.com';
  const clientUser = await prisma.user.upsert({
      where: { email: clientEmail },
      update: { role: 'CLIENT' },
      create: {
          email: clientEmail,
          name: 'Client User',
          password: hashedPassword,
          role: 'CLIENT'
      }
  });

  const client = await prisma.client.upsert({
      where: { userId: clientUser.id },
      update: {},
      create: {
          companyName: 'Acme Corp',
          vatNumber: 'BE0000000001',
          address: 'Rue de la Loi 16, 1000 Bruxelles',
          userId: clientUser.id
      }
  });

  // --- SESSIONS SEEDING ---
  console.log('Seeding sessions for Jean Dupont...');
  // Clear existing sessions
  await prisma.session.deleteMany({ where: { trainerId: formateur.id } });

  const today = new Date();
  today.setHours(0,0,0,0);

  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const dayAfter = new Date(today);
  dayAfter.setDate(today.getDate() + 2);

  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);

  // 1. Tomorrow: FULL_DAY session (Busy)
  await prisma.session.create({
    data: {
      date: tomorrow,
      slot: 'ALL_DAY',
      status: 'CONFIRMED',
      trainer: { connect: { id: formateur.id } },
      formation: { connect: { id: formation.id } },
      client: { connect: { id: client.id } },
      location: 'Rue de la Loi 16, 1000 Bruxelles',
      logistics: JSON.stringify({ wifi: 'Yes', projector: 'Needed', access: 'Badge required' }),
      participants: JSON.stringify([{ name: 'Alice', email: 'alice@acme.com' }, { name: 'Bob', email: 'bob@acme.com' }])
    }
  });

  // 2. Day After: AM session (PM free)
  await prisma.session.create({
    data: {
      date: dayAfter,
      slot: 'AM',
      status: 'CONFIRMED',
      trainer: { connect: { id: formateur.id } },
      formation: { connect: { id: formation.id } },
      client: { connect: { id: client.id } },
    }
  });

  // 3. Next Week: PM session (AM free)
  await prisma.session.create({
    data: {
      date: nextWeek,
      slot: 'PM',
      status: 'CONFIRMED',
      trainer: { connect: { id: formateur.id } },
      formation: { connect: { id: formation.id } },
      client: { connect: { id: client.id } },
    }
  });

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
