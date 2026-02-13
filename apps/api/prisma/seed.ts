import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding ...');

  const hashedPassword = await bcrypt.hash('admin123', 10);
  const baseDate = new Date('2026-02-13T09:00:00'); // Référence : Aujourd'hui selon le contexte utilisateur

  // 1. Zones
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

  for (const z of zonesData) {
    await prisma.zone.upsert({
      where: { code: z.code },
      update: {},
      create: z,
    });
  }

  // 2. Categories
  const categoriesData = ['Bureautique', 'Management', 'Développement', 'Soft Skills', 'Langues', 'Technique'];
  for (const c of categoriesData) {
    await prisma.category.upsert({
      where: { name: c },
      update: {},
      create: { name: c },
    });
  }

  // 3. Users (Admin, Trainers, Clients)
  await prisma.user.upsert({
    where: { email: 'admin@formact.be' },
    update: { role: 'ADMIN', password: hashedPassword },
    create: { email: 'admin@formact.be', name: 'Super Admin', password: hashedPassword, role: 'ADMIN' },
  });

  const trainersData = [
    { firstName: 'Jean', lastName: 'Dupont', email: 'jean.dupont@example.com', zones: ['BRU', 'BW'], experts: ['BRU', 'BW', 'LIE', 'NAM'] },
    { firstName: 'Marie', lastName: 'Lefebvre', email: 'marie.lefebvre@example.com', zones: ['LIE', 'NAM'], experts: ['LIE', 'NAM', 'LUX'] },
    { firstName: 'Thomas', lastName: 'Dubois', email: 'thomas.dubois@example.com', zones: ['HAI'], experts: ['HAI', 'BRU'] },
    { firstName: 'Sophie', lastName: 'Martin', email: 'sophie.martin@example.com', zones: ['ANT', 'LIM'], experts: ['ANT', 'LIM', 'VBR'] },
    { firstName: 'Nicolas', lastName: 'Petit', email: 'nicolas.petit@example.com', zones: ['WVL', 'OVL'], experts: ['WVL', 'OVL', 'VBR', 'BRU'] },
  ];

  const trainers = [];
  for (const t of trainersData) {
    const user = await prisma.user.upsert({
      where: { email: t.email },
      update: { password: hashedPassword, role: 'TRAINER' },
      create: { email: t.email, name: `${t.firstName} ${t.lastName}`, password: hashedPassword, role: 'TRAINER' }
    });

    const trainer = await prisma.formateur.upsert({
      where: { email: t.email },
      update: { userId: user.id },
      create: {
        firstName: t.firstName,
        lastName: t.lastName,
        email: t.email,
        address: `Rue du Formateur ${Math.floor(Math.random() * 100)}, Bruxelles`,
        userId: user.id,
        predilectionZones: { connect: t.zones.map(code => ({ code })) },
        expertiseZones: { connect: t.experts.map(code => ({ code })) },
      }
    });
    trainers.push(trainer);
  }

  // 4. Formations (avec assignation de formateurs pour l'expertise)
  const formationsData = [
    { title: 'Introduction to NestJS', experts: true, cat: 'Développement' },
    { title: 'Management 101', experts: true, cat: 'Management' },
    { title: 'Excel Basics', experts: false, cat: 'Bureautique' },
    { title: 'React Advanced', experts: true, cat: 'Développement' },
    { title: 'Docker for Beginners', experts: true, cat: 'Technique' },
    { title: 'Vente Stratégique', experts: false, cat: 'Soft Skills' },
    { title: 'Anglais Business', experts: false, cat: 'Langues' },
    { title: 'Communication Non-Violente', experts: false, cat: 'Soft Skills' },
    { title: 'Python Data Science', experts: true, cat: 'Développement' },
    { title: 'Leadership & Coaching', experts: true, cat: 'Management' },
  ];

  const formations = [];
  for (const f of formationsData) {
    const assignedTrainers = f.experts
      ? trainers.sort(() => 0.5 - Math.random()).slice(0, 2)
      : [];

    const formation = await prisma.formation.upsert({
      where: { title: f.title },
      update: {
        isExpertise: f.experts,
        authorizedTrainers: { set: assignedTrainers.map(t => ({ id: t.id })) }
      },
      create: {
        title: f.title,
        description: `Description pour ${f.title}`,
        level: 'Intermediate',
        duration: '2 jours',
        durationType: 'FULL_DAY',
        isExpertise: f.experts,
        category: { connect: { name: f.cat } },
        isPublished: true,
        authorizedTrainers: { connect: assignedTrainers.map(t => ({ id: t.id })) }
      }
    });
    formations.push(formation);
  }

  // 5. Clients
  const clientsData = [
    { name: 'Acme Corp', vat: 'BE0000000001', email: 'client@company.com' },
    { name: 'Startup Inc', vat: 'BE0999999999', email: 'newclient@startup.com' },
    { name: 'Tech Solutions', vat: 'BE0888888888', email: 'contact@techsolutions.be' },
    { name: 'Global Logistics', vat: 'BE0777777777', email: 'hr@globallog.com' },
    { name: 'Green Energy SA', vat: 'BE0666666666', email: 'office@greenenergy.be' },
  ];

  const clients = [];
  for (const c of clientsData) {
    const user = await prisma.user.upsert({
      where: { email: c.email },
      update: { role: 'CLIENT' },
      create: { email: c.email, name: c.name, password: hashedPassword, role: 'CLIENT' }
    });

    const client = await prisma.client.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        companyName: c.name,
        vatNumber: c.vat,
        address: `Avenue de l'Industrie ${Math.floor(Math.random() * 200)}, Bruxelles`,
        userId: user.id,
      }
    });
    clients.push(client);
  }

  // 6. Sessions (Target: 20 sessions par semaine centré sur le 13 février)
  console.log('Seeding dense sessions around Feb 13, 2026...');
  await prisma.session.deleteMany({});

  // On génère 320 sessions sur 16 semaines (8 avant, 8 après)
  // Environ 20 sessions par semaine
  for (let i = 0; i < 320; i++) {
    const randomClient = clients[Math.floor(Math.random() * clients.length)];
    const randomFormation = formations[Math.floor(Math.random() * formations.length)];

    // Date aléatoire entre -56 jours (8 sem) et +56 jours (8 sem) par rapport au 13 fév 2026
    const randomDays = Math.floor(Math.random() * 112) - 56;
    const sessionDate = new Date(baseDate.getTime() + randomDays * 24 * 60 * 60 * 1000);

    const statusRoll = Math.random();
    const status = statusRoll > 0.3 ? 'CONFIRMED' : (statusRoll > 0.1 ? 'PENDING' : 'CANCELLED');

    // Assignation de formateur
    let trainerId: string | undefined = undefined;
    if (status === 'CONFIRMED') {
      const authorized = await prisma.formation.findUnique({
        where: { id: randomFormation.id },
        include: { authorizedTrainers: true }
      });

      if (randomFormation.isExpertise && authorized?.authorizedTrainers.length) {
        trainerId = authorized.authorizedTrainers[Math.floor(Math.random() * authorized.authorizedTrainers.length)].id;
      } else if (!randomFormation.isExpertise) {
        trainerId = trainers[Math.floor(Math.random() * trainers.length)].id;
      }
    }

    await prisma.session.create({
      data: {
        date: sessionDate,
        slot: Math.random() > 0.5 ? 'ALL_DAY' : 'AM',
        status: status,
        formationId: randomFormation.id,
        clientId: randomClient.id,
        trainerId: trainerId || null,
        logistics: (status === 'CONFIRMED' && sessionDate < baseDate) ? JSON.stringify({ wifi: true }) : null,
      }
    });
  }

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
