import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg' // Example for PostgreSQL
import { Pool } from 'pg'
import bcrypt from 'bcryptjs';

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })


async function main() {
  // Define three pharmacies with real addresses
  const pharmacies = [
    {
      name: 'Publix',
      address: '5580 Woodbine Rd',
      city: 'Pace',
      state: 'FL',
      zip: 32571,
    },
    {
      name: 'CVS',
      address: '4711 Bayou Blvd',
      city: 'Pensacola',
      state: 'FL',
      zip: 32503,
    },
    {
      name: 'Walgreens',
      address: '6314 N 9th Ave',
      city: 'Pensacola',
      state: 'FL',
      zip: 32504,
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

    // Create service account for this pharmacy
    const serviceName = `${p.name}-service`;
    const emailLocal = 'service@' + p.name.toLowerCase().replace(/\s+/g, '') + '.com';

    // Create admin user for this pharmacy
    const adminName = `${p.name}-admin`;
    const adminEmail = 'admin@' + p.name.toLowerCase().replace(/\s+/g, '') + '.com';
    const adminPasswordRaw = process.env[`ADMIN_PASSWORD_${p.name.toUpperCase().replace(/\W+/g, '_')}`] || process.env.ADMIN_PASSWORD || 'AdminPass!23';
    const adminPasswordHashed = await bcrypt.hash(adminPasswordRaw, 10);

    // Create or update admin user for this pharmacy
    const adminUser = await prisma.user.upsert({
      where: { email: adminEmail },
      create: {
        email: adminEmail,
        firstName: adminName,
        lastName: 'Admin',
        password: adminPasswordHashed,
        role: 'admin',
        pharmacyID: pharmacy.pharmacyID,
      },
      update: {
        firstName: adminName,
        lastName: 'Admin',
        password: adminPasswordHashed,
        role: 'admin',
        pharmacyID: pharmacy.pharmacyID,
      },
    });

    console.log(`Ensured service account ${adminUser.email} for pharmacy ${pharmacy.name} with password ${adminPasswordRaw}`);

    // password resolution: per-pharmacy env var, then generic SERVICE_ACCOUNT_PASSWORD, then fallback
    const envKey = `SERVICE_PASSWORD_${p.name.toUpperCase().replace(/\W+/g, '_')}`;
    const servicePasswordRaw = process.env[envKey] || process.env.SERVICE_ACCOUNT_PASSWORD || 'ChangeMe!23';
    const hashed = await bcrypt.hash(servicePasswordRaw, 10);

    const serviceUser = await prisma.user.upsert({
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

    console.log(`Ensured service account ${serviceUser.email} for pharmacy ${pharmacy.name} with password ${servicePasswordRaw}`);

    // Create drone-specific service account for this pharmacy
    const droneEmail = 'drones@' + p.name.toLowerCase().replace(/\s+/g, '') + '.com';
    const droneUser = await prisma.user.upsert({
      where: { email: droneEmail },
      create: {
        email: droneEmail,
        firstName: `${p.name}-drone`,
        lastName: 'Fleet',
        password: hashed,
        role: 'drone',
        pharmacyID: pharmacy.pharmacyID,
      },
      update: {
        firstName: `${p.name}-drone`,
        lastName: 'Fleet',
        password: hashed,
        role: 'drone',
        pharmacyID: pharmacy.pharmacyID,
      },
    });
    console.log(`Ensured drone account ${droneUser.email} for pharmacy ${pharmacy.name} with password ${servicePasswordRaw}`);
  }

  // Create drones and orders for each pharmacy
  console.log('Seeding drones and orders...');
  for (const p of pharmacies) {
    const pharmacy = await prisma.pharmacies.findFirst({ where: { name: p.name } });
    if (!pharmacy) continue;

    // Create 3 drones for this pharmacy
    for (let i = 1; i <= 3; i++) {
      const drone = await prisma.drones.create({
        data: {
          pharmacyID: pharmacy.pharmacyID,
          currentStatus: 'IDLE',
          batteryLevel: 100 - (i * 10),
        },
      });
      console.log(`Created drone ${drone.droneID} for ${pharmacy.name}`);
    }

    // Create 3 orders for this pharmacy
    const orderData = [
      {
        firstName: 'John',
        lastName: 'Smith',
        address: '5634 Woodbine Rd',
        medication: 'Aspirin',
      },
      {
        firstName: 'Sarah',
        lastName: 'Johnson',
        address: '5400 Berryhill Rd',
        medication: 'Lisinopril',
      },
      {
        firstName: 'Michael',
        lastName: 'Williams',
        address: '3900 Hwy 90',
        medication: 'Atorvastatin',
      },
      {
        firstName: 'Emily',
        lastName: 'Brown',
        address: '4400 Bayou Blvd',
        medication: 'Metformin',
      },
      {
        firstName: 'David',
        lastName: 'Miller',
        address: '1000 College Blvd',
        medication: 'Amoxicillin',
      },
      {
        firstName: 'Jessica',
        lastName: 'Davis',
        address: '6000 N 9th Ave',
        medication: 'Ibuprofen',
      },
      {
        firstName: 'James',
        lastName: 'Garcia',
        address: '6500 N 9th Ave',
        medication: 'Omeprazole',
      },
      {
        firstName: 'Amanda',
        lastName: 'Martinez',
        address: '6200 N 9th Ave',
        medication: 'Losartan',
      },
      {
        firstName: 'Robert',
        lastName: 'Anderson',
        address: '4000 Hwy 90',
        medication: 'Levothyroxine',
      },
    ];

    // Assign 3 unique orders per pharmacy
    const startIdx = pharmacies.indexOf(p) * 3;
    const ordersForPharmacy = orderData.slice(startIdx, startIdx + 3);
    for (const data of ordersForPharmacy) {
      if (!data) continue;
      const order = await prisma.orders.create({
        data: {
          pharmacyID: pharmacy.pharmacyID,
          customerFirstName: data.firstName,
          customerLastName: data.lastName,
          address: data.address,
          city: p.city,
          state: p.state,
          zip: p.zip,
          status: 'PENDING',
          medicationName: data.medication,
        },
      });
      console.log(`Created order ${order.orderID} for ${pharmacy.name}`);
    }
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
