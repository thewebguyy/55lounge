import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const operatorEmail = 'operator@55lounge.com';
  
  await prisma.user.upsert({
    where: { email: operatorEmail },
    update: {},
    create: {
      email: operatorEmail,
      passwordHash: 'dummy_hash_for_now',
      role: 'OPERATOR'
    }
  });

  console.log('Seeded/Verified initial operator account using upsert.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
