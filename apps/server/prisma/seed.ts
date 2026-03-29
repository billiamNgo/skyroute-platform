import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Define three pharmacies
  const pharmacies = [
    {
      name: 'Publix',
      address: '100 Center St',
      city: 'Milton',
      state: 'FL',
      zip: 90001,
    },
    {
      name: 'CVS',
      address: '200 North Ave',
      city: 'Pensacola',
      state: 'FL',
      zip: 90002,
    },
    {
      name: 'Wallgreens',
      address: '300 East Blvd',
      city: 'Pace',
      state: 'FL',
      zip: 90003,
    },
  ];

  console.log('Seeding pharmacies and service accounts...');

  for (const p of pharmacies) {
    const created = await prisma.pharmacies.create({
      data: {
        name: p.name,
        address: p.address,
        city: p.city,
        state: p.state,
        zip: p.zip,
      },
    });

    const serviceName = `${p.name}-service`;
    const emailLocal = 'service@' + p.name.toLowerCase() + '.com';
    const rawPassword = 'ChangeMe!23';
    const hashed = await bcrypt.hash(rawPassword, 10);

    const user = await prisma.user.create({
      data: {
        email: emailLocal,
        firstName: serviceName,
        lastName: 'Service',
        password: hashed,
        role: 'pharmacy',
      },
    });

    console.log(`Created pharmacy ${created.name} (id=${created.pharmacyID}) and service account ${user.email}`);
  }

  console.log('Seeding complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
