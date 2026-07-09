import "dotenv/config";
import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

async function main() {
  console.log('Seeding categories...');

  const categories = [
    { categoryName: 'Ẩm thực', description: 'Nhà hàng, quán ăn, cafe, trà sữa' },
    { categoryName: 'Du lịch', description: 'Khách sạn, homestay, tour du lịch' },
    { categoryName: 'Giải trí', description: 'Rạp chiếu phim, spa, gym, karaoke' },
    { categoryName: 'Mua sắm', description: 'Siêu thị, cửa hàng, trung tâm thương mại' },
    { categoryName: 'Dịch vụ', description: 'Sửa chữa, vệ sinh, giặt ủi' },
  ];

  for (const cat of categories) {
    await prisma.category.create({ data: cat });
    console.log(`Created: ${cat.categoryName}`);
  }

  console.log('Done! Created 5 categories.');
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
