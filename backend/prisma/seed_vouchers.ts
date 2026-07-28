import "dotenv/config";
import { PrismaClient, Prisma } from '../src/generated/prisma/client';
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

// ── Categories ─────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { categoryId: 1, categoryName: 'Ăn uống',       description: 'Nhà hàng, quán ăn' },
  { categoryId: 2, categoryName: 'Cà phê',        description: 'Cà phê, trà, nước giải khát' },
  { categoryId: 3, categoryName: 'Fast food',     description: 'Burger, gà rán, đồ ăn nhanh' },
  { categoryId: 4, categoryName: 'Trà sữa',      description: 'Trà sữa, matcha, yogurt' },
  { categoryId: 5, categoryName: 'Pizza',         description: 'Pizza, mì ý, đồ Ý' },
  { categoryId: 6, categoryName: 'Bánh ngọt',     description: 'Bánh kem, bánh mì, dessert' },
  { categoryId: 7, categoryName: 'Gym & Fitness', description: 'Phòng gym, yoga, fitness' },
  { categoryId: 8, categoryName: 'Spa & Massage', description: 'Spa, massage, chăm sóc sức khỏe' },
  { categoryId: 9, categoryName: 'Game & Giải trí', description: 'Game, giải trí, câu lạc bộ' },
  { categoryId: 10, categoryName: 'Du lịch',      description: 'Du lịch, khách sạn, homestay' },
  { categoryId: 11, categoryName: 'Khách sạn',     description: 'Khách sạn, resort, nghỉ dưỡng' },
  { categoryId: 12, categoryName: 'Phim',          description: 'Rạp chiếu phim, vé xem phim' },
  { categoryId: 13, categoryName: 'Làm đẹp',     description: 'Salon, làm tóc, nail, makeup' },
  { categoryId: 14, categoryName: 'Thể thao',     description: 'Bơi lội, tennis, bóng đá' },
  { categoryId: 15, categoryName: 'Sức khỏe',     description: 'Phòng khám, vitamin, thực phẩm chức năng' },
];

// ── Partners ────────────────────────────────────────────────────────────────────

const PARTNERS = [
  // 1: Ăn uống
  { companyName: 'Nhà hàng Phượng Hoàng',      taxCode: '010000000001' },
  { companyName: 'Nhà hàng Hương Việt',         taxCode: '010000000002' },
  { companyName: 'Quán Ăn Ngon',                 taxCode: '010000000003' },
  // 2: Cà phê
  { companyName: 'Coffee House',                 taxCode: '010000000004' },
  { companyName: 'Highlands Coffee',              taxCode: '010000000005' },
  // 3: Fast food
  { companyName: 'Lotteria Việt Nam',            taxCode: '010000000006' },
  { companyName: 'KFC Việt Nam',                 taxCode: '010000000007' },
  // 4: Trà sữa
  { companyName: 'Gong Cha Việt Nam',            taxCode: '010000000008' },
  { companyName: 'Koi Thé',                      taxCode: '010000000009' },
  // 5: Pizza
  { companyName: 'Pizza Hut Việt Nam',           taxCode: '010000000010' },
  { companyName: 'Domino\'s Pizza Việt Nam',     taxCode: '010000000011' },
  // 6: Bánh ngọt
  { companyName: 'Paris Baguette',               taxCode: '010000000012' },
  { companyName: 'Bánh Mì Hoa Ma',               taxCode: '010000000013' },
  // 7: Gym & Fitness
  { companyName: 'California Fitness & Yoga',    taxCode: '010000000014' },
  { companyName: 'Fit24 Vietnam',                taxCode: '010000000015' },
  // 8: Spa & Massage
  { companyName: 'Spa Elite Saigon',              taxCode: '010000000016' },
  { companyName: ' Massage & Wellness Center',   taxCode: '010000000017' },
  // 9: Game & Giải trí
  { companyName: 'Game Net VN',                  taxCode: '010000000018' },
  // 10: Du lịch
  { companyName: 'Saigontourist',                taxCode: '010000000019' },
  { companyName: 'Vietravel Airlines',           taxCode: '010000000020' },
  // 11: Khách sạn
  { companyName: 'New World Hotel Saigon',       taxCode: '010000000021' },
  { companyName: 'Lotte Hotel Saigon',           taxCode: '010000000022' },
  // 12: Phim
  { companyName: 'Galaxy Cinema',                taxCode: '010000000023' },
  { companyName: 'CGV Cinemas Việt Nam',         taxCode: '010000000024' },
  // 13: Làm đẹp
  { companyName: 'Salon Hair Spa',              taxCode: '010000000025' },
  { companyName: 'L\'Amour Beauty Center',       taxCode: '010000000026' },
  // 14: Thể thao
  { companyName: 'California Fitness & Yoga',   taxCode: '010000000027' },
  // 15: Sức khỏe
  { companyName: 'Pharmacity',                   taxCode: '010000000028' },
  { companyName: 'Long Chau Pharmacy',           taxCode: '010000000029' },
];

// ── Vouchers ────────────────────────────────────────────────────────────────────

const VOUCHER_TEMPLATES: Record<number, Array<Omit<Parameters<typeof prisma.voucher.create>[0], 'data'> & { data: Record<string, unknown> }>> = {
  // 1: Ăn uống
  1: [
    { data: { title: 'Voucher Phượng Hoàng – Giảm 20%', description: 'Giảm 20% cho tất cả món ăn tại nhà hàng Phượng Hoàng. Áp dụng cuối tuần và ngày lễ.', originalPrice: new Prisma.Decimal(500000), salePrice: new Prisma.Decimal(399000), imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop', expiryDays: 30, totalQuantity: 100, availableQuantity: 100 } },
    { data: { title: 'Voucher Hương Việt – Giảm 30%', description: 'Ưu đãi 30% cho món đặc sản miền Trung. Không áp dụng đồ uống.', originalPrice: new Prisma.Decimal(800000), salePrice: new Prisma.Decimal(560000), imageUrl: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800&h=600&fit=crop', expiryDays: 60, totalQuantity: 50, availableQuantity: 50 } },
    { data: { title: 'Combo Quán Ăn Ngon – Giảm 25%', description: 'Giảm 25% toàn bill cho 2 người trở lên. Không áp dụng cho đơn dưới 200.000đ.', originalPrice: new Prisma.Decimal(350000), salePrice: new Prisma.Decimal(262000), imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=600&fit=crop', expiryDays: 14, totalQuantity: 200, availableQuantity: 200 } },
  ],
  // 2: Cà phê
  2: [
    { data: { title: 'Voucher Coffee House – Mua 1 Tặng 1', description: 'Mua 1 tặng 1 trà sữa bất kỳ size nào. Áp dụng cả Online và Offline.', originalPrice: new Prisma.Decimal(55000), salePrice: new Prisma.Decimal(45000), imageUrl: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=800&h=600&fit=crop', expiryDays: 7, totalQuantity: 500, availableQuantity: 500 } },
    { data: { title: 'Highlands Coffee – Giảm 15%', description: 'Giảm 15% cho tất cả đồ uống tại Highlands Coffee. Áp dụng từ thứ 2 đến thứ 6.', originalPrice: new Prisma.Decimal(70000), salePrice: new Prisma.Decimal(59500), imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&h=600&fit=crop', expiryDays: 30, totalQuantity: 300, availableQuantity: 300 } },
  ],
  // 3: Fast food
  3: [
    { data: { title: 'Lotteria – Combo Burger + Khoai Tây', description: 'Combo gồm 1 Burger gà + 1 Khoai tây size M + 1 Nước. Tiết kiệm đến 25%.', originalPrice: new Prisma.Decimal(95000), salePrice: new Prisma.Decimal(72000), imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&h=600&fit=crop', expiryDays: 30, totalQuantity: 400, availableQuantity: 400 } },
    { data: { title: 'KFC – Ưu Đãi Thứ 3 – Giảm 30%', description: 'Giảm 30% cho đơn từ 150.000đ trở lên vào thứ 3 hàng tuần.', originalPrice: new Prisma.Decimal(120000), salePrice: new Prisma.Decimal(84000), imageUrl: 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=800&h=600&fit=crop', expiryDays: 21, totalQuantity: 300, availableQuantity: 300 } },
  ],
  // 4: Trà sữa
  4: [
    { data: { title: 'Gong Cha – Mua 3 Tặng 1', description: 'Mua 3 ly trà sữa bất kỳ, tặng 1 ly cùng loại. Không áp dụng topping thêm.', originalPrice: new Prisma.Decimal(70000), salePrice: new Prisma.Decimal(52500), imageUrl: 'https://images.unsplash.com/photo-1558857563-b371033873b8?w=800&h=600&fit=crop', expiryDays: 14, totalQuantity: 600, availableQuantity: 600 } },
    { data: { title: 'Koi Thé – Giảm 20%', description: 'Giảm 20% cho tất cả đồ uống. Áp dụng cho khách hàng mới vào ngày thứ 2.', originalPrice: new Prisma.Decimal(60000), salePrice: new Prisma.Decimal(48000), imageUrl: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800&h=600&fit=crop', expiryDays: 30, totalQuantity: 400, availableQuantity: 400 } },
  ],
  // 5: Pizza
  5: [
    { data: { title: 'Pizza Hut – Combo Gia Đình', description: '1 Pizza size M + 1 Mì Ý + 2 Nước giải khát. Đủ cho 3-4 người.', originalPrice: new Prisma.Decimal(450000), salePrice: new Prisma.Decimal(359000), imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&h=600&fit=crop', expiryDays: 30, totalQuantity: 150, availableQuantity: 150 } },
    { data: { title: 'Domino\'s – Giảm 35% Đơn Online', description: 'Giảm 35% cho đơn hàng online từ 200.000đ. Miễn phí giao hàng.', originalPrice: new Prisma.Decimal(350000), salePrice: new Prisma.Decimal(227000), imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&h=600&fit=crop', expiryDays: 14, totalQuantity: 200, availableQuantity: 200 } },
  ],
  // 6: Bánh ngọt
  6: [
    { data: { title: 'Paris Baguette – Giảm 20% Bánh Kem', description: 'Giảm 20% cho tất cả bánh kem và bánh ga-lăng. Đặt trước 24h.', originalPrice: new Prisma.Decimal(350000), salePrice: new Prisma.Decimal(280000), imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&h=600&fit=crop', expiryDays: 30, totalQuantity: 80, availableQuantity: 80 } },
    { data: { title: 'Bánh Mì Hoa Ma – Combo Bữa Sáng', description: 'Combo 1 bánh mì thịt + 1 cà phê sữa. Chỉ áp dụng buổi sáng 6h-10h.', originalPrice: new Prisma.Decimal(65000), salePrice: new Prisma.Decimal(49000), imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&h=600&fit=crop', expiryDays: 7, totalQuantity: 300, availableQuantity: 300 } },
  ],
  // 7: Gym & Fitness
  7: [
    { data: { title: 'California Fitness – 1 Tháng Miễn Phí', description: 'Tặng 1 tháng tập gym miễn phí khi mua gói 3 tháng trở lên.', originalPrice: new Prisma.Decimal(1800000), salePrice: new Prisma.Decimal(1350000), imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=600&fit=crop', expiryDays: 90, totalQuantity: 50, availableQuantity: 50 } },
    { data: { title: 'Fit24 – Giảm 25% Gói Yoga', description: 'Giảm 25% cho gói Yoga 10 buổi. Bao gồm yoga, pilates và stretching.', originalPrice: new Prisma.Decimal(2000000), salePrice: new Prisma.Decimal(1500000), imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=600&fit=crop', expiryDays: 60, totalQuantity: 60, availableQuantity: 60 } },
  ],
  // 8: Spa & Massage
  8: [
    { data: { title: 'Spa Elite – Massage Toàn Thân 60p', description: 'Massage toàn thân 60 phút bằng dầu thơm + trà miễn phí sau massage.', originalPrice: new Prisma.Decimal(450000), salePrice: new Prisma.Decimal(359000), imageUrl: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&h=600&fit=crop', expiryDays: 90, totalQuantity: 30, availableQuantity: 30 } },
    { data: { title: 'Massage & Wellness – Giảm 30% Gói Combo', description: 'Giảm 30% gói combo spa 3 buổi: massage + facial + foot spa.', originalPrice: new Prisma.Decimal(1200000), salePrice: new Prisma.Decimal(840000), imageUrl: 'https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=800&h=600&fit=crop', expiryDays: 60, totalQuantity: 40, availableQuantity: 40 } },
  ],
  // 9: Game & Giải trí
  9: [
    { data: { title: 'Game Net VN – 10 Giờ Chơi Miễn Phí', description: 'Nhận 10 giờ chơi game PC miễn phí khi nạp thẻ từ 200.000đ.', originalPrice: new Prisma.Decimal(200000), salePrice: new Prisma.Decimal(150000), imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&h=600&fit=crop', expiryDays: 30, totalQuantity: 100, availableQuantity: 100 } },
  ],
  // 10: Du lịch
  10: [
    { data: { title: 'Saigontourist – Tour Đà Lạt 3N2Đ', description: 'Tour Đà Lạt 3 ngày 2 đêm, bao gồm khách sạn 3 sao + ăn sáng. Khởi hành cuối tuần.', originalPrice: new Prisma.Decimal(3500000), salePrice: new Prisma.Decimal(2790000), imageUrl: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800&h=600&fit=crop', expiryDays: 30, totalQuantity: 20, availableQuantity: 20 } },
    { data: { title: 'Vietravel – Vé Máy Bay Giảm 15%', description: 'Giảm 15% vé máy bay nội địa. Áp dụng cho hạng phổ thông.', originalPrice: new Prisma.Decimal(2500000), salePrice: new Prisma.Decimal(2125000), imageUrl: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&h=600&fit=crop', expiryDays: 14, totalQuantity: 50, availableQuantity: 50 } },
  ],
  // 11: Khách sạn
  11: [
    { data: { title: 'New World Hotel – 1 Đêm Executive Suite', description: '1 đêm tại Executive Suite, bao gồm buffet sáng cho 2 người + spa discount 20%.', originalPrice: new Prisma.Decimal(6500000), salePrice: new Prisma.Decimal(5200000), imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop', expiryDays: 60, totalQuantity: 10, availableQuantity: 10 } },
    { data: { title: 'Lotte Hotel – Weekend Escape Giảm 30%', description: 'Giảm 30% cho đặt phòng cuối tuần (thứ 7, CN). Bao gồm late check-out 14h.', originalPrice: new Prisma.Decimal(4200000), salePrice: new Prisma.Decimal(2940000), imageUrl: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&h=600&fit=crop', expiryDays: 30, totalQuantity: 15, availableQuantity: 15 } },
  ],
  // 12: Phim
  12: [
    { data: { title: 'Galaxy Cinema – 2 Vé + 2 Combo', description: '2 vé xem phim 2D + 2 bắp nước size lớn. Không áp dụng suất chiếu đặc biệt.', originalPrice: new Prisma.Decimal(350000), salePrice: new Prisma.Decimal(279000), imageUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&h=600&fit=crop', expiryDays: 30, totalQuantity: 200, availableQuantity: 200 } },
    { data: { title: 'CGV – Thứ 4 Vé Chỉ 45.000đ', description: 'Vé xem phim 2D chỉ 45.000đ vào thứ 4 hàng tuần. Áp dụng cho tất cả các rạp.', originalPrice: new Prisma.Decimal(90000), salePrice: new Prisma.Decimal(45000), imageUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&h=600&fit=crop', expiryDays: 7, totalQuantity: 500, availableQuantity: 500 } },
  ],
  // 13: Làm đẹp
  13: [
    { data: { title: 'Salon Hair Spa – Cắt tóc + Gội Đầu', description: 'Combo cắt tóc + gội đầu + massage da đầu. Thợ lành nghề 5 năm kinh nghiệm.', originalPrice: new Prisma.Decimal(200000), salePrice: new Prisma.Decimal(149000), imageUrl: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&h=600&fit=crop', expiryDays: 30, totalQuantity: 100, availableQuantity: 100 } },
    { data: { title: 'L\'Amour Beauty – Facial 60p Giảm 25%', description: 'Gói facial cơ bản 60 phút + mask dưỡng. Giảm 25% cho khách hàng mới.', originalPrice: new Prisma.Decimal(350000), salePrice: new Prisma.Decimal(262000), imageUrl: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&h=600&fit=crop', expiryDays: 21, totalQuantity: 80, availableQuantity: 80 } },
  ],
  // 14: Thể thao
  14: [
    { data: { title: 'Hồ Bơi Olympic – 10 Vé Giảm 20%', description: 'Mua 10 vé vào hồ bơi Olympic, được giảm 20%. Vé có hiệu lực trong 30 ngày.', originalPrice: new Prisma.Decimal(300000), salePrice: new Prisma.Decimal(240000), imageUrl: 'https://images.unsplash.com/photo-1575429198097-0414ec08e8cd?w=800&h=600&fit=crop', expiryDays: 30, totalQuantity: 50, availableQuantity: 50 } },
  ],
  // 15: Sức khỏe
  15: [
    { data: { title: 'Pharmacity – Giảm 15% Vitamin', description: 'Giảm 15% cho tất cả vitamin và thực phẩm chức năng. Áp dụng cho đơn từ 100.000đ.', originalPrice: new Prisma.Decimal(250000), salePrice: new Prisma.Decimal(212500), imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&h=600&fit=crop', expiryDays: 14, totalQuantity: 200, availableQuantity: 200 } },
    { data: { title: 'Long Chau – Free Test Vitamin D', description: 'Miễn phí xét nghiệm Vitamin D tại cửa hàng. Kết hợp giảm 20% gói bổ sung vitamin.', originalPrice: new Prisma.Decimal(300000), salePrice: new Prisma.Decimal(240000), imageUrl: 'https://images.unsplash.com/photo-1576602976047-174e57a47881?w=800&h=600&fit=crop', expiryDays: 30, totalQuantity: 100, availableQuantity: 100 } },
  ],
};

// Map partner index ranges to category IDs
const PARTNER_CATEGORY_MAP: Array<{ categoryId: number; partnerStart: number; partnerEnd: number }> = [
  { categoryId: 1,  partnerStart: 0,  partnerEnd: 2  },
  { categoryId: 2,  partnerStart: 3,  partnerEnd: 4  },
  { categoryId: 3,  partnerStart: 5,  partnerEnd: 6  },
  { categoryId: 4,  partnerStart: 7,  partnerEnd: 8  },
  { categoryId: 5,  partnerStart: 9,  partnerEnd: 10 },
  { categoryId: 6,  partnerStart: 11, partnerEnd: 12 },
  { categoryId: 7,  partnerStart: 13, partnerEnd: 14 },
  { categoryId: 8,  partnerStart: 15, partnerEnd: 16 },
  { categoryId: 9,  partnerStart: 17, partnerEnd: 17 },
  { categoryId: 10, partnerStart: 18, partnerEnd: 19 },
  { categoryId: 11, partnerStart: 20, partnerEnd: 21 },
  { categoryId: 12, partnerStart: 22, partnerEnd: 23 },
  { categoryId: 13, partnerStart: 24, partnerEnd: 25 },
  { categoryId: 14, partnerStart: 26, partnerEnd: 26 },
  { categoryId: 15, partnerStart: 27, partnerEnd: 28 },
];

async function main() {
  console.log('🌱 Starting seed...\n');

  // 1. Upsert Categories
  console.log('📁 Creating categories...');
  for (const cat of CATEGORIES) {
    await prisma.category.upsert({
      where: { categoryId: cat.categoryId },
      update: { categoryName: cat.categoryName, description: cat.description },
      create: cat,
    });
  }
  console.log(`  ✅ ${CATEGORIES.length} categories done\n`);

  // 2. Create Partners
  console.log('🏢 Creating partners...');
  const partnerIds: number[] = [];
  for (const partner of PARTNERS) {
    const created = await prisma.partner.create({
      data: { ...partner, status: 'Approved' as const },
    });
    partnerIds.push(created.partnerId);
  }
  console.log(`  ✅ ${partnerIds.length} partners done\n`);

  // 3. Create Vouchers
  console.log('🎟️  Creating vouchers...');
  const now = new Date();
  const endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // +30 days

  let totalVouchers = 0;
  for (const mapping of PARTNER_CATEGORY_MAP) {
    const templates = VOUCHER_TEMPLATES[mapping.categoryId];
    if (!templates) continue;

    for (let i = 0; i < templates.length; i++) {
      const template = templates[i];
      // Round-robin partner assignment
      const partnerIdx = mapping.partnerStart + (i % (mapping.partnerEnd - mapping.partnerStart + 1));
      const partnerId = partnerIds[partnerIdx];

      await prisma.voucher.create({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data: {
          ...(template.data as any),
          partnerId,
          categoryId: mapping.categoryId,
          startDate: now,
          endDate,
          approvalStatus: 'Approved',
          displayStatus: 'Visible',
        },
      });
      totalVouchers++;
    }
  }
  console.log(`  ✅ ${totalVouchers} vouchers done\n`);

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`✅ Seed completed!`);
  console.log(`   Categories : ${CATEGORIES.length}`);
  console.log(`   Partners   : ${partnerIds.length}`);
  console.log(`   Vouchers   : ${totalVouchers}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
