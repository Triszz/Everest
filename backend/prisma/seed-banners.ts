import "dotenv/config";
import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

async function main() {
  // Check if banners already exist
  const existingBanners = await prisma.banner.count();
  if (existingBanners > 0) {
    console.log(`Found ${existingBanners} banners in database. Skipping...`);
    return;
  }

  console.log('Seeding banners...');

  const banners = [
    {
      title: 'Summer Sale - Giảm Đến 50%',
      imageUrl: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&h=400&fit=crop',
      targetUrl: '/vouchers?category=sale',
      displayOrder: 1,
      status: 'Visible' as const,
    },
    {
      title: 'Ưu Đãi Du Lịch Mùa Hè',
      imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&h=400&fit=crop',
      targetUrl: '/category/2',
      displayOrder: 2,
      status: 'Visible' as const,
    },
    {
      title: 'Voucher Ăn Uống Giới Hạn',
      imageUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&h=400&fit=crop',
      targetUrl: '/category/1',
      displayOrder: 3,
      status: 'Visible' as const,
    },
  ];

  for (const banner of banners) {
    await prisma.banner.create({ data: banner });
    console.log(`Created: ${banner.title}`);
  }

  console.log('Done! Created 3 banners.');
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
