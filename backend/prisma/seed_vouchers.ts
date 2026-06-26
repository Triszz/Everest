import "dotenv/config";
import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

async function main() {
  console.log('Seeding partners and vouchers...');

  // Create Partners
  const partners = await Promise.all([
    prisma.partner.create({
      data: {
        companyName: 'Nhà hàng Phượng Hoàng',
        taxCode: '012345678901',
        status: 'Approved',
      },
    }),
    prisma.partner.create({
      data: {
        companyName: 'Coffee House',
        taxCode: '012345678902',
        status: 'Approved',
      },
    }),
    prisma.partner.create({
      data: {
        companyName: 'Galaxy Cinema',
        taxCode: '012345678903',
        status: 'Approved',
      },
    }),
    prisma.partner.create({
      data: {
        companyName: 'Nhà hàng Hương Việt',
        taxCode: '012345678904',
        status: 'Approved',
      },
    }),
    prisma.partner.create({
      data: {
        companyName: 'Spa & Beauty Center',
        taxCode: '012345678905',
        status: 'Approved',
      },
    }),
  ]);
  console.log(`Created ${partners.length} partners`);

  const now = new Date();
  const endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days

  // Create Vouchers
  const vouchers = [
    // Ẩm thực (categoryId: 1)
    {
      partnerId: partners[0].partnerId,
      categoryId: 1,
      title: 'Voucher Ưu Đãi Nhà Hàng Phượng Hoàng',
      description: 'Giảm 20% cho tất cả món ăn tại nhà hàng',
      originalPrice: 500000,
      salePrice: 399000,
      totalQuantity: 100,
      availableQuantity: 100,
      imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop',
      startDate: now,
      endDate: endDate,
      expiryDays: 30,
      approvalStatus: 'Approved' as const,
      displayStatus: 'Visible' as const,
    },
    {
      partnerId: partners[3].partnerId,
      categoryId: 1,
      title: 'Voucher Hương Việt - Giảm 30%',
      description: 'Ưu đãi 30% cho món đặc sản miền Trung',
      originalPrice: 800000,
      salePrice: 560000,
      totalQuantity: 50,
      availableQuantity: 50,
      imageUrl: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800&h=600&fit=crop',
      startDate: now,
      endDate: endDate,
      expiryDays: 60,
      approvalStatus: 'Approved' as const,
      displayStatus: 'Visible' as const,
    },
    // Du lịch (categoryId: 2) - skip partners for now
    // Giải trí (categoryId: 3)
    {
      partnerId: partners[2].partnerId,
      categoryId: 3,
      title: 'Voucher Galaxy Cinema - 2 Vé Combo',
      description: '2 vé xem phim + 2 bắp nước size lớn',
      originalPrice: 350000,
      salePrice: 279000,
      totalQuantity: 200,
      availableQuantity: 200,
      imageUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&h=600&fit=crop',
      startDate: now,
      endDate: endDate,
      expiryDays: 14,
      approvalStatus: 'Approved' as const,
      displayStatus: 'Visible' as const,
    },
    // Spa (categoryId: 3)
    {
      partnerId: partners[4].partnerId,
      categoryId: 3,
      title: 'Voucher Spa - Massage Thư Giãn 60p',
      description: 'Massage toàn thân 60 phút + trà miễn phí',
      originalPrice: 450000,
      salePrice: 359000,
      totalQuantity: 30,
      availableQuantity: 30,
      imageUrl: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&h=600&fit=crop',
      startDate: now,
      endDate: endDate,
      expiryDays: 90,
      approvalStatus: 'Approved' as const,
      displayStatus: 'Visible' as const,
    },
    // Cafe (categoryId: 1)
    {
      partnerId: partners[1].partnerId,
      categoryId: 1,
      title: 'Voucher Coffee House - Trà Sữa Size M',
      description: 'Mua 1 tặng 1 trà sữa any flavor',
      originalPrice: 55000,
      salePrice: 45000,
      totalQuantity: 500,
      availableQuantity: 500,
      imageUrl: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=800&h=600&fit=crop',
      startDate: now,
      endDate: endDate,
      expiryDays: 7,
      approvalStatus: 'Approved' as const,
      displayStatus: 'Visible' as const,
    },
  ];

  for (const v of vouchers) {
    await prisma.voucher.create({ data: v });
    console.log(`Created voucher: ${v.title}`);
  }

  console.log(`\nDone! Created ${partners.length} partners and ${vouchers.length} vouchers.`);
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
