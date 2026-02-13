import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding ...');

  const hashedPassword = await bcrypt.hash('admin123', 10);

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

  // 3. Admin User
  await prisma.user.upsert({
    where: { email: 'admin@formact.be' },
    update: { role: 'ADMIN', password: hashedPassword },
    create: {
      email: 'admin@formact.be',
      name: 'Super Admin',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  // 4. Trainers
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
        address: `Rue du Formateur ${Math.floor(Math.random() * 100)}, 1000 Bruxelles`,
        userId: user.id,
        predilectionZones: { connect: t.zones.map(code => ({ code })) },
        expertiseZones: { connect: t.experts.map(code => ({ code })) },
      }
    });
    trainers.push(trainer);
  }

  // 5. Formations
  const formationsData = [
    { title: 'Introduction to NestJS', desc: 'Learn NestJS basics', cat: 'Développement', level: 'Beginner', dur: '2 jours', type: 'FULL_DAY', experts: true },
    { title: 'Management 101', desc: 'Basics of Team Management', cat: 'Management', level: 'Intermediate', dur: '1 jour', type: 'FULL_DAY', experts: true },
    { title: 'Excel Basics', desc: 'Spreadsheets for everyone', cat: 'Bureautique', level: 'Beginner', dur: '3 jours', type: 'HALF_DAY', experts: false },
    { title: 'React Advanced', desc: 'Deep dive into Hooks and Patterns', cat: 'Développement', level: 'Advanced', dur: '3 jours', type: 'FULL_DAY', experts: true },
    { title: 'Docker for Beginners', desc: 'Containerize your apps', cat: 'Technique', level: 'Beginner', dur: '1 jour', type: 'FULL_DAY', experts: true },
    { title: 'Vente Stratégique', desc: 'Boost your sales skills', cat: 'Soft Skills', level: 'Advanced', dur: '2 jours', type: 'FULL_DAY', experts: false },
    { title: 'Anglais Business', desc: 'Professional English', cat: 'Langues', level: 'Intermediate', dur: '10 jours', type: 'HALF_DAY', experts: false },
    { title: 'Communication Non-Violente', desc: 'Improve workspace interactions', cat: 'Soft Skills', level: 'Beginner', dur: '1 jour', type: 'HALF_DAY', experts: false },
    { title: 'Python Data Science', desc: 'Data analysis with Python', cat: 'Développement', level: 'Intermediate', dur: '5 jours', type: 'FULL_DAY', experts: true },
    { title: 'Leadership & Coaching', desc: 'Manage with impact', cat: 'Management', level: 'Advanced', dur: '3 jours', type: 'FULL_DAY', experts: true },
  ];

  const formations = [];
  for (const f of formationsData) {
    // If it's an expertise formation, assign 1-2 random trainers
    const assignedTrainers = f.experts
      ? trainers.sort(() => 0.5 - Math.random()).slice(0, Math.max(1, Math.floor(Math.random() * 3)))
      : [];

    const formation = await prisma.formation.upsert({
      where: { title: f.title },
      update: {
        isExpertise: f.experts,
        authorizedTrainers: { set: assignedTrainers.map(t => ({ id: t.id })) }
      },
      create: {
        title: f.title,
        description: f.desc,
        level: f.level,
        duration: f.dur,
        durationType: f.type,
        isExpertise: f.experts,
        category: { connect: { name: f.cat } },
        isPublished: true,
        authorizedTrainers: { connect: assignedTrainers.map(t => ({ id: t.id })) }
      }
    });
    formations.push(formation);
  }

  // 6. Clients
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
        address: `Avenue de l'Industrie ${Math.floor(Math.random() * 200)}, 1000 Bruxelles`,
        userId: user.id,
      }
    });
    clients.push(client);
  }

  // 7. Sessions (Targeting 20 per week over ~16 weeks)
  console.log('Seeding sessions (~350 sessions for high density)...');
  await prisma.session.deleteMany({});

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Massive seeding
  for (let i = 0; i < 350; i++) {
    const randomClient = clients[Math.floor(Math.random() * clients.length)];
    const randomFormation = formations[Math.floor(Math.random() * formations.length)];

    // Choose date in a window of 4 months (-60 to +60 days)
    const randomDays = Math.floor(Math.random() * 120) - 60;
    const sessionDate = new Date(today.getTime() + randomDays * 24 * 60 * 60 * 1000);

    // Weighted status
    const statusRoll = Math.random();
    const status = statusRoll > 0.4 ? 'CONFIRMED' : (statusRoll > 0.1 ? 'PENDING' : 'CANCELLED');

    // For trainer assignment:
    // If it's an expertise formation, we MUST pick one from the authorized trainers of that formation
    const authorizedForThis = await prisma.formation.findUnique({
      where: { id: randomFormation.id },
      include: { authorizedTrainers: true }
    });

    let trainerId: string | undefined = undefined;
    if (status === 'CONFIRMED' && Math.random() > 0.05) {
      if (randomFormation.isExpertise && authorizedForThis?.authorizedTrainers.length) {
        trainerId = authorizedForThis.authorizedTrainers[Math.floor(Math.random() * authorizedForThis.authorizedTrainers.length)].id;
      } else if (!randomFormation.isExpertise) {
        trainerId = trainers[Math.floor(Math.random() * trainers.length)].id;
      }
    }

    await prisma.session.create({
      data: {
        date: sessionDate,
        slot: Math.random() > 0.4 ? 'ALL_DAY' : (Math.random() > 0.5 ? 'AM' : 'PM'),
        status: status,
        formation: { connect: { id: randomFormation.id } },
        client: { connect: { id: randomClient.id } },
        trainer: trainerId ? { connect: { id: trainerId } } : undefined,
        proofUrl: (status === 'CONFIRMED' && sessionDate < today && Math.random() > 0.3) ? '/files/proofs/attendance.pdf' : null,
        billedAt: (status === 'CONFIRMED' && sessionDate < today && Math.random() > 0.6) ? new Date(sessionDate.getTime() + 2 * 24 * 60 * 60 * 1000) : null,
        logistics: (status === 'CONFIRMED' && Math.random() > 0.2) ? JSON.stringify({ wifi: true, access: 'Badge required' }) : null,
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
