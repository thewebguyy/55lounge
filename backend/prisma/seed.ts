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

  // Seed Categories
  const catCocktails = await prisma.category.upsert({
    where: { slug: 'cocktails' },
    update: {},
    create: {
      name: 'Cocktails',
      slug: 'cocktails',
      order: 1
    }
  });

  const catMains = await prisma.category.upsert({
    where: { slug: 'main-course' },
    update: {},
    create: {
      name: 'Main Course',
      slug: 'main-course',
      order: 2
    }
  });

  console.log('Seeded initial categories.');

  // Seed Menu Items
  await prisma.menuItem.upsert({
    where: { id: 'seed-item-1' }, // Note: We don't have a unique constraint on name, so we'll just create a dummy ID for the seed or use findFirst
    update: {},
    create: {
      id: 'seed-item-1',
      name: 'Classic Mojito',
      description: 'White rum, sugar, lime juice, soda water, and mint.',
      price: 450000, // 4,500 NGN
      imageUrl: '/images/mojito.jpg',
      categoryId: catCocktails.id
    }
  });

  await prisma.menuItem.upsert({
    where: { id: 'seed-item-2' },
    update: {},
    create: {
      id: 'seed-item-2',
      name: 'Grilled Croaker Fish',
      description: 'Spicy grilled croaker served with plantain and coleslaw.',
      price: 1200000, // 12,000 NGN
      imageUrl: '/images/croaker.jpg',
      categoryId: catMains.id
    }
  });

  console.log('Seeded initial menu items.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
