import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Idempotent operator creation
  const operatorEmail = 'operator@55lounge.com';
  
  const existingOperator = await prisma.user.findUnique({
    where: { email: operatorEmail }
  });

  if (!existingOperator) {
    await prisma.user.create({
      data: {
        email: operatorEmail,
        passwordHash: 'dummy_hash_for_now',
        role: 'OPERATOR'
      }
    });
    console.log('Seeded initial operator account.');
  } else {
    console.log('Operator account already exists. Skipping.');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
