import "dotenv/config";
import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

async function main() {
  // ─── Popups ────────────────────────────────────────────────────────────
  const existingPopups = await prisma.popup.count();
  if (existingPopups > 0) {
    console.log(`Found ${existingPopups} popups in database. Skipping popups...`);
  } else {
    console.log('Seeding popups...');
    const popups = [
      {
        title: 'Ưu đãi mùa hè lên đến 50%',
        body: 'Đăng ký thành viên ngay hôm nay để nhận ngay voucher 100K cho đơn hàng đầu tiên.',
        imageUrl: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&h=500&fit=crop',
        ctaLabel: 'Nhận ngay',
        ctaTargetUrl: '/register',
        status: 'Visible' as const,
      },
      {
        title: 'Flash Sale cuối tuần',
        body: 'Các voucher hot nhất đang chờ bạn. Nhanh tay kẻo lỡ!',
        imageUrl: 'https://images.unsplash.com/photo-1556742208-999815fca738?w=800&h=500&fit=crop',
        ctaLabel: 'Xem ngay',
        ctaTargetUrl: '/vouchers',
        status: 'Hidden' as const,
      },
      {
        title: 'Bảo trì hệ thống',
        body: 'Hệ thống sẽ bảo trì từ 02:00 - 04:00 sáng ngày mai. Mong quý khách thông cảm.',
        imageUrl: null,
        ctaLabel: null,
        ctaTargetUrl: null,
        status: 'Hidden' as const,
      },
    ];

    for (const popup of popups) {
      await prisma.popup.create({ data: popup });
      console.log(`Created popup: ${popup.title}`);
    }
    console.log('Done! Created popups.');
  }

  // ─── Posts ─────────────────────────────────────────────────────────────
  const existingPosts = await prisma.post.count();
  if (existingPosts > 0) {
    console.log(`Found ${existingPosts} posts in database. Skipping posts...`);
  } else {
    const adminUser = await prisma.user.findFirst({
      where: { role: 'Admin' },
    });
    if (!adminUser) {
      console.log('No Admin user found. Skipping posts seed (run after creating an admin).');
    } else {
      console.log('Seeding posts...');
      const now = new Date();
      const posts = [
        {
          authorId: adminUser.userId,
          title: 'Hướng dẫn mua voucher trên Everest',
          content:
            '# Hướng dẫn mua voucher\n\n1. Chọn voucher bạn yêu thích\n2. Thêm vào giỏ hàng\n3. Thanh toán và nhận mã voucher qua email\n4. Xuất trình mã tại cửa hàng đối tác',
          imageUrl: 'https://images.unsplash.com/photo-1556742208-999815fca738?w=800&h=400&fit=crop',
          status: 'Visible' as const,
          publishedAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        },
        {
          authorId: adminUser.userId,
          title: 'Chính sách đổi trả voucher',
          content:
            'Voucher đã mua có thể đổi trả trong vòng 7 ngày nếu chưa sử dụng. Liên hệ hotline 1900-xxxx để được hỗ trợ.',
          imageUrl: null,
          status: 'Visible' as const,
          publishedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
        },
        {
          authorId: adminUser.userId,
          title: 'Khuyến mãi tháng 7 - Giảm đến 70%',
          content: 'Đón hè với loạt ưu đãi hấp dẫn từ các đối tác lớn trên toàn quốc.',
          imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=400&fit=crop',
          status: 'Hidden' as const,
          publishedAt: null,
        },
      ];

      for (const post of posts) {
        await prisma.post.create({ data: post });
        console.log(`Created post: ${post.title}`);
      }
      console.log('Done! Created posts.');
    }
  }
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());