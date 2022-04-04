import { PrismaClient } from '@prisma/client';

import userSeeder from './seeders/userSeeder';

const prisma = new PrismaClient();

async function main() {
  console.log(`Start seeding ...`);

  await userSeeder();

  console.log(`Seeding finished.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
