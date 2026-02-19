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

  // 6. Sessions (Rythme lent : Commandes anticipées de 3-4 mois)
  console.log('Seeding slow rhythm operational situation...');
  await prisma.session.deleteMany({});

  const participantsList = [
    JSON.stringify([{ name: 'Alice Merton', email: 'alice@example.com' }, { name: 'Bob Smith', email: 'bob@example.com' }]),
    JSON.stringify([{ name: 'Charlie Brown', email: 'charlie@example.com' }, { name: 'Diana Prince', email: 'diana@example.com' }]),
  ];

  // --- Logique anti-conflit avancée (Slots AM/PM/ALL_DAY) ---
  const occupiedSlots = new Map<string, Set<string>>();

  const markOccupied = (trainerId: string, date: Date, slot: string) => {
    const dayKey = date.toISOString().split('T')[0];
    if (!occupiedSlots.has(trainerId)) occupiedSlots.set(trainerId, new Set());
    const slots = occupiedSlots.get(trainerId)!;

    if (slot === 'ALL_DAY') {
      slots.add(`${dayKey}-AM`);
      slots.add(`${dayKey}-PM`);
      slots.add(`${dayKey}-ALL_DAY`);
    } else {
      slots.add(`${dayKey}-${slot}`);
    }
  };

  const isAvailable = (trainerId: string, date: Date, slot: string) => {
    const dayKey = date.toISOString().split('T')[0];
    const slots = occupiedSlots.get(trainerId);
    if (!slots) return true;

    if (slot === 'ALL_DAY') {
      return !slots.has(`${dayKey}-AM`) && !slots.has(`${dayKey}-PM`) && !slots.has(`${dayKey}-ALL_DAY`);
    }
    return !slots.has(`${dayKey}-${slot}`) && !slots.has(`${dayKey}-ALL_DAY`);
  };

  const createSession = async (offsetDays: number, statusRoll: string, overrides: any = {}) => {
    const randomClient = clients[Math.floor(Math.random() * clients.length)];
    const randomFormation = formations[Math.floor(Math.random() * formations.length)];
    const date = new Date(baseDate.getTime() + offsetDays * 24 * 60 * 60 * 1000);
    date.setHours(9, 0, 0, 0);

    // Rythme lent : La commande est passée 100 jours avant la formation
    const createdAt = new Date(date.getTime() - 100 * 24 * 60 * 60 * 1000);

    // Slot par défaut aléatoire
    const slotChoices = ['AM', 'PM', 'ALL_DAY'];
    const slot = overrides.slot || slotChoices[Math.floor(Math.random() * slotChoices.length)];

    // Si un trainerId est fourni, on marque le créneau comme occupé
    if (overrides.trainerId) {
      markOccupied(overrides.trainerId, date, slot);
    }

    return prisma.session.create({
      data: {
        date,
        createdAt: overrides.createdAt || createdAt,
        slot,
        status: statusRoll,
        formationId: randomFormation.id,
        clientId: randomClient.id,
        location: 'Site Client Principal',
        ...overrides
      }
    });
  };

  // --- 1. DEMANDES (PENDING) - Prévues pour dans 3-4 mois ---
  for (let i = 0; i < 4; i++) {
    await createSession(90 + (i * 7), 'PENDING', { trainerId: null });
  }

  // --- 2. ASSIGNATIONS (CONFIRMED sans Formateur) - Prévues pour dans 2 mois ---
  for (let i = 0; i < 5; i++) {
    await createSession(60 + (i * 5), 'CONFIRMED', { trainerId: null });
  }

  // --- 3. LOGISTIQUE INCOMPLÈTE (Future, J-14) - Prévues pour tout bientôt ---
  for (let i = 0; i < 5; i++) {
    const dateOffset = 7 + (i * 2);
    const trainerId = trainers[i % trainers.length].id; // Rotation simple
    await createSession(dateOffset, 'CONFIRMED', {
      trainerId,
      logistics: null,
      participants: null
    });
  }

  // --- 4. ÉMARGEMENTS MANQUANTS - Sessions très récentes (J-1 à J-7) ---
  for (let i = 0; i < 8; i++) {
    const dateOffset = -(1 + i);
    const trainerId = trainers[(i + 2) % trainers.length].id; // Rotation décalée
    await createSession(dateOffset, 'CONFIRMED', {
      trainerId,
      proofUrl: null
    });
  }

  // --- 5. À FACTURER - Sessions de fin Janvier / début Février ---
  for (let i = 0; i < 4; i++) {
    const dateOffset = -(15 + i);
    const trainerId = trainers[(i + 4) % trainers.length].id; // Rotation décalée
    await createSession(dateOffset, 'PROOF_RECEIVED', {
      trainerId,
      proofUrl: 'https://example.com/sheet.pdf',
      billedAt: null,
      participants: participantsList[0]
    });
  }

  // --- 6. SESSIONS SAINES (DENSITÉ MAXIMALE : Planning plein) - 200 sessions ---
  // On remplit les 3 prochains mois de manière intensive (AM/PM séparés)
  for (let i = 0; i < 200; i++) {
    const dateOffset = Math.floor(i / 4) + 1;
    const slotChoices = ['AM', 'PM', 'AM', 'PM', 'ALL_DAY']; // On favorise les demi-journées pour la densité
    const slot = slotChoices[i % slotChoices.length];
    const targetDate = new Date(baseDate.getTime() + dateOffset * 24 * 60 * 60 * 1000);
    targetDate.setHours(9, 0, 0, 0);

    const shuffledTrainers = [...trainers].sort(() => Math.random() - 0.5);
    const availableTrainer = shuffledTrainers.find(t => isAvailable(t.id, targetDate, slot));

    if (availableTrainer) {
      await createSession(dateOffset, 'CONFIRMED', {
        trainerId: availableTrainer.id,
        slot,
        logistics: JSON.stringify({ wifi: "yes", subsidies: "no", videoMaterial: ["Projector"] }),
        participants: participantsList[Math.floor(Math.random() * participantsList.length)]
      });
    }
  }

  // --- 7. ARCHIVES (Facturées) - Étale sur l'année 2025 ---
  for (let i = 0; i < 40; i++) {
    const offset = -(40 + (i * 8));
    const sDate = new Date(baseDate.getTime() + offset * 24 * 60 * 60 * 1000);
    const basePrice = 850 + (Math.floor(Math.random() * 5) * 50);
    const trainerRef = trainers[i % trainers.length];

    await createSession(offset, 'INVOICED', {
      trainerId: trainerRef.id,
      proofUrl: 'https://archive.com/proof.pdf',
      billedAt: new Date(sDate.getTime() + 10 * 24 * 60 * 60 * 1000),
      participants: participantsList[1],
      logistics: JSON.stringify({ wifi: "yes", subsidies: "yes", videoMaterial: ["Projector"], writingMaterial: ["Pens"] }),
      billingData: JSON.stringify({
        basePrice,
        optionsFee: 20,
        optionsDetails: ["Kit Vidéo (20€)"],
        distanceFee: 0,
        adminAdjustment: 0,
        finalPrice: basePrice + 20
      })
    });
  }

  console.log('Seeding finished with realistic slow-paced rhythm and no trainer collisions.');

  // 8. Site Configuration (CMS)
  console.log('Seeding Site Configuration...');

  const configs = [
    {
      key: 'global_settings',
      value: JSON.stringify({
        logoText: 'FORM-ACT',
        email: 'contact@form-act.com',
        phone: '+32 2 123 45 67',
        address: 'Avenue de la Formation 123, 1000 Bruxelles',
        social: {
          linkedin: 'https://linkedin.com/company/form-act',
          facebook: 'https://facebook.com/formact'
        }
      })
    },
    {
      key: 'home_hero',
      value: JSON.stringify({
        tagline: 'The Signature of Expertise',
        title: 'Activez votre <br /><span class="text-primary italic">Expertise.</span>',
        intro: 'La puissance du réseau Form-Act dans une interface moderne pour propulser vos talents vers de nouveaux sommets.'
      })
    },
    {
      key: 'home_promo',
      value: JSON.stringify({
        title: 'Plateforme n°1 <br />des Experts d\'Élite',
        subtitle: 'Le Futur de la Formation',
        description: 'Accédez à des programmes exclusifs et gérez votre croissance dans une interface pensée pour la performance.',
        buttonLabel: 'Rejoindre le Réseau'
      })
    },
    {
      key: 'home_values',
      value: JSON.stringify([
        {
          title: 'Qualiopi & <br />Certifications',
          text: 'Toutes nos formations répondent aux référentiels de qualité les plus exigeants pour garantir votre satisfaction et vos financements.'
        },
        {
          title: 'Réseau d\'Experts <br />Indépendants',
          text: 'Un accès direct aux meilleurs formateurs du marché, sélectionnés pour leur expertise technique et leur pédagogie innovante.'
        },
        {
          title: 'Tracking & <br />Reporting Live',
          text: 'Suivez l\'impact de vos formations en temps réel grâce à notre dashboard intelligent et nos outils de reporting automatisés.'
        }
      ])
    },
    {
      key: 'home_trust',
      value: JSON.stringify({
        quote: '"Form-Act a radicalement changé notre approche de la formation continue. La qualité des intervenants est simplement inégalée."',
        author: 'Julien Morel',
        role: 'DRH — TechCorp Solutions'
      })
    },
    {
      key: 'home_cta',
      value: JSON.stringify({
        title: 'Prêt à transformer <br />vos équipes ?',
        buttonPrimary: 'Demander un Devis',
        buttonSecondary: 'Explorer le Catalogue'
      })
    }
  ];

  for (const config of configs) {
    await prisma.siteConfiguration.upsert({
      where: { key: config.key },
      update: {}, // Don't overwrite if exists
      create: config
    });
  }
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
