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
      password: hashedPassword,
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
      }
    },
    create: {
      firstName: 'Jean',
      lastName: 'Dupont',
      email: formateurEmail,
      address: 'Rue de la Gare 15, 1000 Bruxelles',
      userId: formateurUser.id,
      predilectionZones: {
        connect: [{ code: 'BRU' }, { code: 'BW' }]
      },
      expertiseZones: {
        connect: [{ code: 'BRU' }, { code: 'BW' }, { code: 'LIE' }, { code: 'NAM' }]
      }
    },
  });

  // NestJS Formation (Expertise)
  const formationTitle = 'Introduction to NestJS';
  const formation = await prisma.formation.upsert({
    where: { title: formationTitle },
    update: {
      duration: '2 jours',
      durationType: 'FULL_DAY',
      isExpertise: true,
      authorizedTrainers: {
        connect: { email: formateurEmail }
      },
      category: {
        connect: { name: 'Développement' },
      },
      agreementCodes: JSON.stringify([
        { region: 'Wallonie', code: 'NEST-001' },
        { region: 'Bruxelles', code: 'BXL-NEST' }
      ]),
    },
    create: {
      title: formationTitle,
      description: 'Learn the basics of NestJS framework.',
      level: 'Beginner',
      duration: '2 jours',
      durationType: 'FULL_DAY',
      isExpertise: true,
      authorizedTrainers: {
        connect: { email: formateurEmail }
      },
      category: {
        connect: { name: 'Développement' },
      },
      agreementCodes: JSON.stringify([
        { region: 'Wallonie', code: 'NEST-001' },
        { region: 'Bruxelles', code: 'BXL-NEST' }
      ]),
    },
  });

  // Management Formation (Expertise, but Jean not authorized)
  const managementTitle = 'Management 101';
  const mgtFormation = await prisma.formation.upsert({
    where: { title: managementTitle },
    update: {
      category: { connect: { name: 'Management' } },
      isExpertise: true,
    },
    create: {
      id: 'management-101',
      title: managementTitle,
      description: 'Basics of Team Management',
      level: 'Beginner',
      duration: '1 jour',
      isExpertise: true,
      // No authorized trainers
      category: { connect: { name: 'Management' } },
    },
  });

  // Excel (Bureautique) - Expertise with Jean
  const excelTitle = 'Excel Basics';
  const excelFormation = await prisma.formation.upsert({
    where: { title: excelTitle },
    update: {
      durationType: 'HALF_DAY',
      category: { connect: { name: 'Bureautique' } },
      isExpertise: true,
      authorizedTrainers: {
        connect: { email: formateurEmail }
      },
    },
    create: {
      title: excelTitle,
      description: 'Spreadsheets for everyone',
      level: 'Beginner',
      duration: '3 jours',
      durationType: 'HALF_DAY',
      isExpertise: true,
      authorizedTrainers: {
        connect: { email: formateurEmail }
      },
      category: { connect: { name: 'Bureautique' } },
    },
  });

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
      userId: clientUser.id,
      createdAt: new Date('2023-01-01')
    }
  });

  // Client Recent
  const clientRecentEmail = 'newclient@startup.com';
  const clientRecentUser = await prisma.user.upsert({
    where: { email: clientRecentEmail },
    update: { role: 'CLIENT' },
    create: {
      email: clientRecentEmail,
      name: 'New Client',
      password: hashedPassword,
      role: 'CLIENT'
    }
  });

  await prisma.client.upsert({
    where: { userId: clientRecentUser.id },
    update: {},
    create: {
      companyName: 'Startup Inc',
      vatNumber: 'BE0999999999',
      address: 'Avenue Louise 100, 1050 Bruxelles',
      userId: clientRecentUser.id,
      createdAt: new Date('2023-11-15')
    }
  });

  // --- SESSIONS SEEDING ---
  console.log('Seeding sessions for Priority Actions scenarios...');
  // Clear all existing sessions to start clean
  await prisma.session.deleteMany({});

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const plus3Days = new Date(today);
  plus3Days.setDate(today.getDate() + 3);

  const plus10Days = new Date(today);
  plus10Days.setDate(today.getDate() + 10);

  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const longAgo = new Date(today);
  longAgo.setDate(today.getDate() - 20);

  // 1. Demandes à valider (PENDING)
  await prisma.session.create({
    data: {
      date: plus10Days,
      slot: 'ALL_DAY',
      status: 'PENDING',
      formation: { connect: { id: formation.id } },
      client: { connect: { id: client.id } },
    }
  });

  const startupInc = await prisma.client.findUnique({ where: { userId: clientRecentUser.id } });

  await prisma.session.create({
    data: {
      date: plus3Days,
      slot: 'AM',
      status: 'PENDING',
      formation: { connect: { id: mgtFormation.id } },
      client: { connect: { id: startupInc.id } },
    }
  });

  // 2. Sessions sans formateur (CONFIRMED et trainerId est null)
  await prisma.session.create({
    data: {
      date: plus10Days,
      slot: 'ALL_DAY',
      status: 'CONFIRMED',
      formation: { connect: { id: excelFormation.id } },
      client: { connect: { id: client.id } },
    }
  });

  // 3. Logistique manquante (J-7, status CONFIRMED et logistics est null)
  await prisma.session.create({
    data: {
      date: plus3Days,
      slot: 'ALL_DAY',
      status: 'CONFIRMED',
      trainer: { connect: { id: formateur.id } },
      formation: { connect: { id: formation.id } },
      client: { connect: { id: client.id } },
      logistics: null,
    }
  });

  // 4. Feuilles de présence manquantes (Session passée, status CONFIRMED, proofUrl null)
  await prisma.session.create({
    data: {
      date: yesterday,
      slot: 'ALL_DAY',
      status: 'CONFIRMED',
      trainer: { connect: { id: formateur.id } },
      formation: { connect: { id: formation.id } },
      client: { connect: { id: client.id } },
      proofUrl: null
    }
  });

  // 5. À Facturer (Session passée, proofUrl présent, mais billedAt null)
  await prisma.session.create({
    data: {
      date: longAgo,
      slot: 'ALL_DAY',
      status: 'CONFIRMED',
      trainer: { connect: { id: formateur.id } },
      formation: { connect: { id: mgtFormation.id } },
      client: { connect: { id: client.id } },
      proofUrl: "/files/proofs/attendance-sheet.pdf",
      billedAt: null
    }
  });

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
