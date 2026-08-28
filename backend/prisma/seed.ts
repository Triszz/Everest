import "dotenv/config";
import { PrismaClient, UserRole, AccountStatus, PartnerStatus, VoucherApprovalStatus, VoucherDisplayStatus, PaymentStatus, VoucherUsageStatus, BannerStatus, PopupStatus, PostStatus } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcrypt";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

async function main() {
  console.log("🌱 Bắt đầu tạo Dữ liệu Mẫu (Seed Data) chuẩn Demo Vấn Đáp...");

  // Hashing passwords
  const adminPasswordHash = await bcrypt.hash("Admin@123456", 10);
  const partnerPasswordHash = await bcrypt.hash("Partner@123456", 10);
  const staffPasswordHash = await bcrypt.hash("Staff@123456", 10);
  const customerPasswordHash = await bcrypt.hash("Customer@123456", 10);

  // 1. Dọn dẹp dữ liệu cũ trước khi seed
  await prisma.$executeRawUnsafe(`
    TRUNCATE TABLE 
      "admin_audit_log", "notifications", "notification_preferences", "email_otps", 
      "password_resets", "feedbacks", "reviews", "issued_vouchers", "order_items", 
      "orders", "cart_items", "voucher_branches", "vouchers", "policies", 
      "posts", "popups", "banners", "categories", "branches", "users", "partners" 
    RESTART IDENTITY CASCADE;
  `);

  // 2. Tạo Categories
  console.log("📂 Đang tạo Danh mục ngành hàng...");
  const catAmThuc = await prisma.category.create({ data: { categoryName: "Ẩm thực", description: "Nhà hàng, quán ăn, cafe, trà sữa" } });
  const catDuLich = await prisma.category.create({ data: { categoryName: "Du lịch", description: "Khách sạn, homestay, tour du lịch, vé tham quan" } });
  const catGiaiTri = await prisma.category.create({ data: { categoryName: "Giải trí", description: "Rạp chiếu phim, spa, gym, karaoke, khu vui chơi" } });
  const catMuaSam = await prisma.category.create({ data: { categoryName: "Mua sắm", description: "Siêu thị, thời trang, đồ gia dụng, TT thương mại" } });
  const catDichVu = await prisma.category.create({ data: { categoryName: "Dịch vụ", description: "Sửa chữa, chăm sóc xe, vệ sinh, giặt ủi" } });

  // 3. Tạo Partners
  console.log("🏢 Đang tạo Doanh nghiệp Đối tác...");
  const partnerHighlands = await prisma.partner.create({
    data: {
      companyName: "Công ty Cổ phần Bất động sản & Thương mại Highlands",
      taxCode: "0301234567",
      representativeName: "Nguyễn Thái Bình",
      representativePosition: "Giám đốc Kinh doanh",
      representativePhone: "0911111111",
      representativeEmail: "owner@highlands.com",
      status: PartnerStatus.Approved,
    },
  });

  const partnerCGV = await prisma.partner.create({
    data: {
      companyName: "Công ty TNHH CJ CGV Việt Nam",
      taxCode: "0107654321",
      representativeName: "Trần Minh Đức",
      representativePosition: "Trưởng phòng Marketing",
      representativePhone: "0922222222",
      representativeEmail: "owner@cgv.com",
      status: PartnerStatus.Approved,
    },
  });

  const partnerVinWonders = await prisma.partner.create({
    data: {
      companyName: "Công ty Cổ phần VinWonders Việt Nam",
      taxCode: "4201987654",
      representativeName: "Lê Hoàng Nam",
      representativePosition: "Giám đốc Vận hành",
      representativePhone: "0933333333",
      representativeEmail: "owner@vinwonders.com",
      status: PartnerStatus.Approved,
    },
  });

  const partnerHaidilaoPending = await prisma.partner.create({
    data: {
      companyName: "Công ty TNHH Ẩm thực Haidilao Việt Nam",
      taxCode: "0319998888",
      representativeName: "Phạm Văn Thành",
      representativePosition: "Đại diện Pháp luật",
      representativePhone: "0944444444",
      representativeEmail: "owner@haidilao.com",
      status: PartnerStatus.Pending, // Chờ Admin duyệt demo
    },
  });

  // 4. Tạo Users (Admin, Partner Owner, Partner Cashier/Staff, Customers)
  console.log("👤 Đang tạo Tài khoản Người dùng...");
  // Admin
  const adminUser = await prisma.user.create({
    data: {
      email: "admin@everest.com",
      phoneNumber: "0900000000",
      passwordHash: adminPasswordHash,
      fullName: "Trần Quản Trị Vien",
      role: UserRole.Admin,
      status: AccountStatus.Active,
      emailVerified: true,
    },
  });

  // Partner Owners
  const ownerHighlands = await prisma.user.create({
    data: {
      email: "owner@highlands.com",
      phoneNumber: "0911111111",
      passwordHash: partnerPasswordHash,
      fullName: "Nguyễn Thái Bình (Highlands Owner)",
      role: UserRole.Partner_Owner,
      status: AccountStatus.Active,
      partnerId: partnerHighlands.partnerId,
      emailVerified: true,
    },
  });

  const ownerCGV = await prisma.user.create({
    data: {
      email: "owner@cgv.com",
      phoneNumber: "0922222222",
      passwordHash: partnerPasswordHash,
      fullName: "Trần Minh Đức (CGV Owner)",
      role: UserRole.Partner_Owner,
      status: AccountStatus.Active,
      partnerId: partnerCGV.partnerId,
      emailVerified: true,
    },
  });

  // Cashiers / Staff
  const cashierHighlandsQ1 = await prisma.user.create({
    data: {
      email: "cashier.q1@highlands.com",
      phoneNumber: "0911111112",
      passwordHash: staffPasswordHash,
      fullName: "Lê Thu Ngân (Highlands Q1)",
      role: UserRole.Partner_Cashier,
      status: AccountStatus.Active,
      partnerId: partnerHighlands.partnerId,
      emailVerified: true,
    },
  });

  const cashierHighlandsQ3 = await prisma.user.create({
    data: {
      email: "cashier.q3@highlands.com",
      phoneNumber: "0911111113",
      passwordHash: staffPasswordHash,
      fullName: "Phạm Thu Ngân (Highlands Q3)",
      role: UserRole.Partner_Cashier,
      status: AccountStatus.Active,
      partnerId: partnerHighlands.partnerId,
      emailVerified: true,
    },
  });

  const cashierCGVHN = await prisma.user.create({
    data: {
      email: "cashier.hn@cgv.com",
      phoneNumber: "0922222223",
      passwordHash: staffPasswordHash,
      fullName: "Đỗ Thu Ngân (CGV Hà Nội)",
      role: UserRole.Partner_Cashier,
      status: AccountStatus.Active,
      partnerId: partnerCGV.partnerId,
      emailVerified: true,
    },
  });

  // Customers
  const customer1 = await prisma.user.create({
    data: {
      email: "customer1@gmail.com",
      phoneNumber: "0901234567",
      passwordHash: customerPasswordHash,
      fullName: "Nguyễn Văn Khách Hàng",
      role: UserRole.Customer,
      status: AccountStatus.Active,
      emailVerified: true,
    },
  });

  const customer2 = await prisma.user.create({
    data: {
      email: "customer2@gmail.com",
      phoneNumber: "0987654321",
      passwordHash: customerPasswordHash,
      fullName: "Trần Thị Mua Sắm",
      role: UserRole.Customer,
      status: AccountStatus.Active,
      emailVerified: true,
    },
  });

  // 5. Tạo Branches (gán cột `city` phục vụ lọc khu vực)
  console.log("📍 Đang tạo Chi nhánh Đối tác...");
  const branchHighlandsQ1 = await prisma.branch.create({
    data: {
      partnerId: partnerHighlands.partnerId,
      cashierId: cashierHighlandsQ1.userId,
      branchName: "Highlands Nguyễn Du - Quận 1",
      address: "Số 75 Nguyễn Du, Phường Bến Nghé, Quận 1",
      city: "TP. Hồ Chí Minh",
      phoneNumber: "02838221144",
    },
  });

  const branchHighlandsQ3 = await prisma.branch.create({
    data: {
      partnerId: partnerHighlands.partnerId,
      cashierId: cashierHighlandsQ3.userId,
      branchName: "Highlands Võ Văn Tần - Quận 3",
      address: "Số 202 Võ Văn Tần, Phường 5, Quận 3",
      city: "TP. Hồ Chí Minh",
      phoneNumber: "02838332255",
    },
  });

  const branchCGVHN = await prisma.branch.create({
    data: {
      partnerId: partnerCGV.partnerId,
      cashierId: cashierCGVHN.userId,
      branchName: "CGV Vincom Nguyễn Chí Thanh",
      address: "Tầng 6, Vincom Center, 54A Nguyễn Chí Thanh, Đống Đa",
      city: "Hà Nội",
      phoneNumber: "02439748888",
    },
  });

  const branchCGVHCM = await prisma.branch.create({
    data: {
      partnerId: partnerCGV.partnerId,
      branchName: "CGV Hùng Vương Plaza - Quận 5",
      address: "Tầng 7, Hùng Vương Plaza, 126 Hồng Bàng, Quận 5",
      city: "TP. Hồ Chí Minh",
      phoneNumber: "02839552299",
    },
  });

  const branchVinWondersNhaTrang = await prisma.branch.create({
    data: {
      partnerId: partnerVinWonders.partnerId,
      branchName: "VinWonders Nha Trang",
      address: "Đảo Hòn Tre, Vĩnh Nguyên, TP. Nha Trang",
      city: "Khánh Hòa",
      phoneNumber: "19006677",
    },
  });

  const branchVinWondersDaNang = await prisma.branch.create({
    data: {
      partnerId: partnerVinWonders.partnerId,
      branchName: "VinWonders Nam Hội An",
      address: "Đường Thanh Niên, Bình Minh, Thăng Bình",
      city: "Đà Nẵng",
      phoneNumber: "19006688",
    },
  });

  // 6. Tạo Vouchers
  console.log("🎫 Đang tạo Voucher sản phẩm...");
  const now = new Date();
  const future30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const voucherHighlandsFreeze = await prisma.voucher.create({
    data: {
      partnerId: partnerHighlands.partnerId,
      categoryId: catAmThuc.categoryId,
      title: "Combo 2 Freeze Trà Green Tea Size L Tươi Mát Highlands",
      description: "Thưởng thức Freeze Trà Green Tea đá xay chuẩn vị Highlands. Áp dụng toàn hệ thống.",
      originalPrice: 138000,
      salePrice: 89000,
      applicationCondition: "Hạn sử dụng 30 ngày kể từ ngày mua. Áp dụng dùng tại quán hoặc mang về.",
      totalQuantity: 200,
      availableQuantity: 180,
      imageUrl: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600&auto=format&fit=crop",
      startDate: now,
      endDate: future30Days,
      expiryDays: 30,
      approvalStatus: VoucherApprovalStatus.Approved,
      displayStatus: VoucherDisplayStatus.Visible,
    },
  });

  const voucherCGV2D = await prisma.voucher.create({
    data: {
      partnerId: partnerCGV.partnerId,
      categoryId: catGiaiTri.categoryId,
      title: "Vé Xem Phim CGV 2D Toàn Quốc All Days - Đổi Vé Tự Động",
      description: "Vé xem phim 2D áp dụng cho tất cả các cụm rạp CGV toàn quốc, tất cả các ngày trong tuần.",
      originalPrice: 120000,
      salePrice: 79000,
      applicationCondition: "Đổi trực tiếp tại quầy vé CGV hoặc đặt vé trực tuyến trên ứng dụng CGV.",
      totalQuantity: 500,
      availableQuantity: 450,
      imageUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&auto=format&fit=crop",
      startDate: now,
      endDate: future30Days,
      expiryDays: 45,
      approvalStatus: VoucherApprovalStatus.Approved,
      displayStatus: VoucherDisplayStatus.Visible,
    },
  });

  const voucherVinWondersNhaTrang = await prisma.voucher.create({
    data: {
      partnerId: partnerVinWonders.partnerId,
      categoryId: catDuLich.categoryId,
      title: "Vé Vào Cổng VinWonders Nha Trang Trọn Gói Vui Chơi & Cáp Treo",
      description: "Trải nghiệm khu vui chơi giải trí hàng đầu Việt Nam tại đảo Hòn Tre Nha Trang.",
      originalPrice: 950000,
      salePrice: 750000,
      applicationCondition: "Gồm cáp treo 2 chiều và trọn gói tất cả trò chơi tại VinWonders Nha Trang.",
      totalQuantity: 100,
      availableQuantity: 90,
      imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop",
      startDate: now,
      endDate: future30Days,
      expiryDays: 60,
      approvalStatus: VoucherApprovalStatus.Approved,
      displayStatus: VoucherDisplayStatus.Visible,
    },
  });

  const voucherHighlandsPhin = await prisma.voucher.create({
    data: {
      partnerId: partnerHighlands.partnerId,
      categoryId: catAmThuc.categoryId,
      title: "E-Voucher Cà Phê Phin Sữa Đá Size L Highlands Coffee",
      description: "Cà phê Phin sữa đá Đậm đà chuẩn vị truyền thống Việt Nam.",
      originalPrice: 55000,
      salePrice: 39000,
      applicationCondition: "Áp dụng tại tất cả các chi nhánh Highlands toàn quốc.",
      totalQuantity: 300,
      availableQuantity: 290,
      imageUrl: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop",
      startDate: now,
      endDate: future30Days,
      expiryDays: 30,
      approvalStatus: VoucherApprovalStatus.Approved,
      displayStatus: VoucherDisplayStatus.Visible,
    },
  });

  const voucherHaidilaoPending = await prisma.voucher.create({
    data: {
      partnerId: partnerHaidilaoPending.partnerId,
      categoryId: catAmThuc.categoryId,
      title: "Combo Lẩu Haidilao Thượng Hạng Dành Cho 2-4 Người",
      description: "Thưởng thức lẩu Tứ Xuyên và dịch vụ múa mì đặc sắc tại Haidilao.",
      originalPrice: 500000,
      salePrice: 399000,
      applicationCondition: "Áp dụng dùng tại nhà hàng từ Thứ 2 đến Thứ 6.",
      totalQuantity: 50,
      availableQuantity: 50,
      imageUrl: "https://images.unsplash.com/photo-1555126634-323283e090fa?w=600&auto=format&fit=crop",
      startDate: now,
      endDate: future30Days,
      expiryDays: 30,
      approvalStatus: VoucherApprovalStatus.Pending, // Để Admin demo tính năng Duyệt Voucher
      displayStatus: VoucherDisplayStatus.Hidden,
    },
  });

  // 7. Gán Voucher - Branches
  console.log("🔗 Đang gán Voucher vào Chi nhánh...");
  await prisma.voucherBranch.createMany({
    data: [
      { voucherId: voucherHighlandsFreeze.voucherId, branchId: branchHighlandsQ1.branchId },
      { voucherId: voucherHighlandsFreeze.voucherId, branchId: branchHighlandsQ3.branchId },
      { voucherId: voucherHighlandsPhin.voucherId, branchId: branchHighlandsQ1.branchId },
      { voucherId: voucherHighlandsPhin.voucherId, branchId: branchHighlandsQ3.branchId },
      { voucherId: voucherCGV2D.voucherId, branchId: branchCGVHN.branchId },
      { voucherId: voucherCGV2D.voucherId, branchId: branchCGVHCM.branchId },
      { voucherId: voucherVinWondersNhaTrang.voucherId, branchId: branchVinWondersNhaTrang.branchId },
      { voucherId: voucherVinWondersNhaTrang.voucherId, branchId: branchVinWondersDaNang.branchId },
    ],
  });

  // 8. Tạo Orders, OrderItems & IssuedVouchers (Phục vụ Demo Khách hàng & Thu ngân gạch mã)
  console.log("🛍️ Đang tạo Đơn hàng mẫu & Mã Voucher điện tử...");
  
  // Đơn 1: Customer 1 mua Highlands Freeze (Mã chưa sử dụng — Phục vụ Demo Cashier Quét/Nhập mã)
  const order1 = await prisma.order.create({
    data: {
      customerId: customer1.userId,
      totalAmount: 89000,
      paymentMethod: "VNPAY",
      paymentStatus: PaymentStatus.Paid,
      createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
    },
  });

  const orderItem1 = await prisma.orderItem.create({
    data: {
      orderId: order1.orderId,
      voucherId: voucherHighlandsFreeze.voucherId,
      quantity: 1,
      price: 89000,
    },
  });

  const issuedVoucherUnused = await prisma.issuedVoucher.create({
    data: {
      orderItemId: orderItem1.orderItemId,
      voucherCode: "HL-FREEZE-2026-8888",
      status: VoucherUsageStatus.Unused,
      validFrom: now,
      validTo: future30Days,
    },
  });

  // Đơn 2: Customer 1 mua CGV Ticket (Mã ĐÃ SỬ DỤNG — Phục vụ Demo Xem lịch sử gạch mã)
  const order2 = await prisma.order.create({
    data: {
      customerId: customer1.userId,
      totalAmount: 79000,
      paymentMethod: "VNPAY",
      paymentStatus: PaymentStatus.Paid,
      createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
    },
  });

  const orderItem2 = await prisma.orderItem.create({
    data: {
      orderId: order2.orderId,
      voucherId: voucherCGV2D.voucherId,
      quantity: 1,
      price: 79000,
    },
  });

  await prisma.issuedVoucher.create({
    data: {
      orderItemId: orderItem2.orderItemId,
      voucherCode: "CGV-TICKET-2026-9999",
      status: VoucherUsageStatus.Used,
      validFrom: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
      validTo: future30Days,
      usedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
      usedAtBranchId: branchCGVHN.branchId,
    },
  });

  // 9. Tạo Reviews & Feedbacks
  console.log("⭐ Đang tạo Đánh giá & Khiếu nại mẫu...");
  await prisma.review.create({
    data: {
      customerId: customer1.userId,
      voucherId: voucherHighlandsFreeze.voucherId,
      issuedVoucherId: issuedVoucherUnused.issuedVoucherId,
      rating: 5,
      comment: "Freeze Trà Green Tea uống siêu ngon, quán Highlands Nguyễn Du không gian đẹp và phục vụ chu đáo!",
    },
  });

  await prisma.feedback.create({
    data: {
      customerId: customer1.userId,
      type: "complaint",
      subject: "Khiếu nại thời gian chờ đổi mã voucher tại cửa hàng",
      message: "Tôi có mua mã voucher Highlands nhưng quầy đông người phải chờ hơn 15 phút mới được gạch mã.",
      email: "customer1@gmail.com",
      phone: "0901234567",
      orderId: order1.orderId,
      voucherCode: "HL-FREEZE-2026-8888",
      status: "Open",
      ticketId: "FBK-M5K89-X21",
    },
  });

  // 10. Banners, Popups, Posts, Policies (Phục vụ Admin CMS Demo)
  console.log("📢 Đang tạo Banner, Popup, Bài viết CMS...");
  await prisma.banner.createMany({
    data: [
      { title: "Siêu Siêu Voucher Ẩm Thực Giảm Đến 50%", imageUrl: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200", status: BannerStatus.Visible },
      { title: "Đón Hè Rực Rỡ cùng Vé Siêu Khu Vui Chơi VinWonders", imageUrl: "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=1200", status: BannerStatus.Visible },
    ],
  });

  await prisma.popup.createMany({
    data: [
      { title: "Chào mừng bạn đến với Everest!", body: "Nhập mã MOC2026 giảm thêm 20k cho đơn hàng đầu tiên.", ctaLabel: "Khám phá ngay", status: PopupStatus.Visible },
    ],
  });

  await prisma.post.create({
    data: {
      authorId: adminUser.userId,
      title: "Mẹo Săn Voucher Giảm Giá Cực Đỉnh Cho Tín Đồ Ẩm Thực 2026",
      content: "Tổng hợp các kinh nghiệm mua voucher ưu đãi lớn từ các thương hiệu hàng đầu như Highlands, Haidilao...",
      status: PostStatus.Visible,
    },
  });

  await prisma.policy.createMany({
    data: [
      { title: "Điều khoản sử dụng E-Voucher", content: "Mã voucher chỉ có giá trị sử dụng 01 lần duy nhất và không có giá trị quy đổi thành tiền mặt." },
      { title: "Chính sách bảo mật thông tin", content: "Cam kết bảo mật tuyệt đối thông tin giao dịch trực tuyến của khách hàng." },
    ],
  });

  // 11. Tạo thêm 10 Users đăng ký từ tháng 4 đến tháng 8/2026
  console.log("👥 Đang tạo thêm 10 Users đăng ký (tháng 4-8/2026)...");
  const newCustomers = [];
  for (let i = 1; i <= 10; i++) {
    const month = 3 + Math.floor((i - 1) / 3) + 1; // tháng 4, 5, 6, 7, 8
    const day = ((i - 1) % 10) + 1;
    const createdAt = new Date(2026, month - 1, day, 10 + (i % 5), 30);

    const customer = await prisma.user.create({
      data: {
        email: `customer_new_${i}@gmail.com`,
        phoneNumber: `090${1000000 + i}`,
        passwordHash: customerPasswordHash,
        fullName: `Khách Hàng Mới ${i}`,
        role: UserRole.Customer,
        status: AccountStatus.Active,
        emailVerified: true,
        createdAt,
      },
    });
    newCustomers.push(customer);
  }

  // 12. Tạo thêm 10 Orders từ tháng 4 đến tháng 8/2026
  console.log("🛒 Đang tạo thêm 10 Orders (tháng 4-8/2026)...");
  const vouchers = [voucherHighlandsFreeze, voucherCGV2D, voucherVinWondersNhaTrang, voucherHighlandsPhin];

  // Phân bổ trạng thái: 4 Paid, 3 Pending, 3 Cancelled
  const paymentStatuses = [
    PaymentStatus.Paid,
    PaymentStatus.Paid,
    PaymentStatus.Paid,
    PaymentStatus.Paid,
    PaymentStatus.Pending,
    PaymentStatus.Pending,
    PaymentStatus.Pending,
    PaymentStatus.Cancelled,
    PaymentStatus.Cancelled,
    PaymentStatus.Cancelled,
  ];

  for (let i = 1; i <= 10; i++) {
    const month = 3 + Math.floor((i - 1) / 3) + 1; // tháng 4, 5, 6, 7, 8
    const day = ((i - 1) % 10) + 1;
    const orderCreatedAt = new Date(2026, month - 1, day, 14 + (i % 8), 15);
    const voucher = vouchers[(i - 1) % vouchers.length];
    const customer = newCustomers[(i - 1) % newCustomers.length];
    const paymentStatus = paymentStatuses[i - 1];

    // Tạo order
    const order = await prisma.order.create({
      data: {
        customerId: customer.userId,
        totalAmount: voucher.salePrice,
        paymentMethod: "VNPAY",
        paymentStatus,
        createdAt: orderCreatedAt,
      },
    });

    // Chỉ tạo order item và issued voucher khi chưa bị hủy
    if (paymentStatus !== PaymentStatus.Cancelled) {
      const orderItem = await prisma.orderItem.create({
        data: {
          orderId: order.orderId,
          voucherId: voucher.voucherId,
          quantity: 1,
          price: voucher.salePrice,
        },
      });

      const validFrom = orderCreatedAt;
      const validTo = new Date(validFrom.getTime() + voucher.expiryDays * 24 * 60 * 60 * 1000);
      const voucherCode = `EV-${String(voucher.voucherId).padStart(4, '0')}-${2026}${String(i).padStart(4, '0')}`;

      // Nếu là Pending: issued voucher chưa active
      // Nếu là Paid: tạo issued voucher (Unused hoặc Used tùy i)
      const usedStatus = paymentStatus === PaymentStatus.Pending
        ? VoucherUsageStatus.Unused
        : (i <= 6 ? VoucherUsageStatus.Unused : VoucherUsageStatus.Used);
      const usedAtBranch = usedStatus === VoucherUsageStatus.Used
        ? (voucher === voucherCGV2D ? branchCGVHN.branchId : branchHighlandsQ1.branchId)
        : undefined;
      const usedAt = usedStatus === VoucherUsageStatus.Used
        ? new Date(orderCreatedAt.getTime() + 1 * 24 * 60 * 60 * 1000)
        : undefined;

      await prisma.issuedVoucher.create({
        data: {
          orderItemId: orderItem.orderItemId,
          voucherCode,
          status: usedStatus,
          validFrom,
          validTo,
          usedAt,
          usedAtBranchId: usedAtBranch,
        },
      });
    }
  }

  console.log("🎉 Seed Data hoàn tất thành công 100%! Sẵn sàng cho buổi Vấn Đáp!");
}

main()
  .catch((e) => {
    console.error("❌ Lỗi khi Seed Data:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
