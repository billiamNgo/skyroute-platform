import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg' // Example for PostgreSQL
import { Pool } from 'pg'
import bcrypt from 'bcryptjs';

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })


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
      name: 'Walgreens',
      address: '300 East Blvd',
      city: 'Pace',
      state: 'FL',
      zip: 90003,
    },
  ];

  console.log('Seeding pharmacies and service accounts...');

  for (const p of pharmacies) {
    // ensure pharmacy exists (idempotent)
    let pharmacy = await prisma.pharmacies.findFirst({ where: { name: p.name } });
    if (!pharmacy) {
      pharmacy = await prisma.pharmacies.create({
        data: {
          name: p.name,
          address: p.address,
          city: p.city,
          state: p.state,
          zip: p.zip,
        },
      });
      console.log(`Created pharmacy ${pharmacy.name} (id=${pharmacy.pharmacyID})`);
    } else {
      console.log(`Found existing pharmacy ${pharmacy.name} (id=${pharmacy.pharmacyID})`);
    }

    const serviceName = `${p.name}-service`;
    const emailLocal = 'service@' + p.name.toLowerCase().replace(/\s+/g, '') + '.com';

    // password resolution: per-pharmacy env var, then generic SERVICE_ACCOUNT_PASSWORD, then fallback
    const envKey = `SERVICE_PASSWORD_${p.name.toUpperCase().replace(/\W+/g, '_')}`;
    const rawPassword = process.env[envKey] || process.env.SERVICE_ACCOUNT_PASSWORD || 'ChangeMe!23';
    const hashed = await bcrypt.hash(rawPassword, 10);

    const user = await prisma.user.upsert({
      where: { email: emailLocal },
      create: {
        email: emailLocal,
        firstName: serviceName,
        lastName: 'Service',
        password: hashed,
        role: 'pharmacy',
        pharmacyID: pharmacy.pharmacyID,
      },
      update: {
        // keep service account details in sync; update password and pharmacy linkage
        firstName: serviceName,
        lastName: 'Service',
        password: hashed,
        role: 'pharmacy',
        pharmacyID: pharmacy.pharmacyID,
      },
    });

    console.log(`Ensured service account ${user.email} for pharmacy ${pharmacy.name}`);
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
