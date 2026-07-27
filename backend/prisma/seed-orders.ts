import "dotenv/config";
import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

const customers = [
  { email: 'lan.nguyen@example.com', fullName: 'Nguyễn Thị Lan', phoneNumber: '0901234567' },
  { email: 'minh.tran@example.com', fullName: 'Trần Văn Minh', phoneNumber: '0902345678' },
  { email: 'hoa.le@example.com', fullName: 'Lê Thị Hoa', phoneNumber: '0903456789' },
  { email: 'dat.pham@example.com', fullName: 'Phạm Tiến Đạt', phoneNumber: '0904567890' },
  { email: 'mai.vo@example.com', fullName: 'Võ Thanh Mai', phoneNumber: '0905678901' },
];

const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = <T>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

const generateVoucherCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 12; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
};

async function ensureCustomer(email: string, fullName: string, phoneNumber: string) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return existing;
  return prisma.user.create({
    data: {
      email,
      fullName,
      phoneNumber,
      role: 'Customer',
      status: 'Active',
    },
  });
}

async function createOrder(args: {
  customerId: string;
  paymentMethod: 'Wallet' | 'BankTransfer' | 'COD';
  paymentStatus: 'Pending' | 'Paid' | 'Cancelled';
  cancelledAt?: Date;
  cancelReason?: string;
  refundedAt?: Date;
  refundAmount?: number;
  refundReason?: string;
  isGift?: boolean;
  receiverEmail?: string;
  giftMessage?: string;
  vouchers: { voucherId: number; title: string; price: number; quantity: number; validFrom: Date; validTo: Date }[];
  daysAgo: number;
}) {
  const totalAmount = args.vouchers.reduce((sum, v) => sum + v.price * v.quantity, 0);
  const createdAt = new Date(Date.now() - args.daysAgo * 24 * 60 * 60 * 1000);

    return prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          customerId: args.customerId,
          totalAmount,
          paymentMethod: args.paymentMethod,
          paymentStatus: args.paymentStatus,
          isGift: args.isGift ?? false,
          receiverEmail: args.receiverEmail,
          giftMessage: args.giftMessage,
          cancelledAt: args.cancelledAt,
          cancelReason: args.cancelReason,
          refundedAt: args.refundedAt,
          refundAmount: args.refundAmount,
          refundReason: args.refundReason,
          createdAt,
          updatedAt: createdAt,
        },
      });

      for (const v of args.vouchers) {
        const oi = await tx.orderItem.create({
          data: {
            orderId: order.orderId,
            voucherId: v.voucherId,
            quantity: v.quantity,
            price: v.price,
          },
        });

        // Phát hành mã voucher cho mỗi đơn vị
        let issuedStatus: 'Unused' | 'Used' | 'Expired' | 'Locked' = 'Unused';
        if (args.paymentStatus === 'Cancelled') issuedStatus = 'Expired';
        if (args.paymentStatus === 'Paid' && args.daysAgo > 5 && Math.random() < 0.3) {
          issuedStatus = 'Used';
        }

        const issuedRows = [];
        for (let i = 0; i < v.quantity; i++) {
          const usedAt = issuedStatus === 'Used' ? new Date(createdAt.getTime() + randInt(1, 5) * 24 * 60 * 60 * 1000) : null;
          issuedRows.push({
            orderItemId: oi.orderItemId,
            voucherCode: generateVoucherCode(),
            status: issuedStatus,
            validFrom: v.validFrom,
            validTo: v.validTo,
            usedAt,
          });
        }
        if (issuedRows.length) await tx.issuedVoucher.createMany({ data: issuedRows });
      }

      return order;
    }, { timeout: 30000 });
}

async function main() {
  console.log('Seeding orders...');

  // 1. Đảm bảo customers
  const customerUsers = [];
  for (const c of customers) {
    const u = await ensureCustomer(c.email, c.fullName, c.phoneNumber);
    customerUsers.push(u);
    console.log(`  customer: ${c.email}`);
  }

  // 2. Lấy vouchers có sẵn
  const vouchers = await prisma.voucher.findMany({
    take: 20,
    orderBy: { voucherId: 'asc' },
  });
  if (vouchers.length === 0) {
    console.warn('  ⚠ Không có voucher nào — chạy seed_vouchers trước.');
  }

  // 3. Xóa orders cũ (cascade kéo theo orderItems + issuedVouchers)
  await prisma.order.deleteMany({});
  console.log('  cleared old orders');

  // 4. Tạo ~25 orders với phân bổ trạng thái cố định
  const now = Date.now();
  const orderPlans: Array<Parameters<typeof createOrder>[0]> = [];

  // Helper: chọn trạng thái theo index (đảm bảo đa dạng)
  const statusFor = (i: number): 'Pending' | 'Paid' | 'PaidRefunded' | 'Cancelled' => {
    const mod = i % 10;
    if (mod < 3) return 'Pending';        // 30% pending
    if (mod < 5) return 'Cancelled';      // 20% cancelled
    if (mod < 7) return 'PaidRefunded';   // 20% paid + refunded
    return 'Paid';                         // 30% paid bình thường
  };

  for (let i = 0; i < 25; i++) {
    const customer = pick(customerUsers);
    const numVouchers = randInt(1, 3);
    const selectedVouchers = [] as Array<{
      voucherId: number;
      title: string;
      price: number;
      quantity: number;
      validFrom: Date;
      validTo: Date;
    }>;

    let totalSoFar = 0;
    for (let j = 0; j < numVouchers; j++) {
      const v = pick(vouchers);
      const qty = randInt(1, 2);
      const price = Number(v.salePrice);
      selectedVouchers.push({
        voucherId: v.voucherId,
        title: v.title,
        price,
        quantity: qty,
        validFrom: v.startDate,
        validTo: v.endDate,
      });
      totalSoFar += price * qty;
    }

    const daysAgo = randInt(0, 60);
    const paymentMethod = pick(['Wallet', 'BankTransfer', 'COD']) as 'Wallet' | 'BankTransfer' | 'COD';
    const isGift = i % 7 === 0;

    const statusKind = statusFor(i);
    let paymentStatus: 'Pending' | 'Paid' | 'Cancelled' = 'Paid';
    let cancelledAt: Date | undefined;
    let cancelReason: string | undefined;
    let refundedAt: Date | undefined;
    let refundAmount: number | undefined;
    let refundReason: string | undefined;

    if (statusKind === 'Pending') {
      paymentStatus = 'Pending';
    } else if (statusKind === 'Cancelled') {
      paymentStatus = 'Cancelled';
      cancelledAt = new Date(now - randInt(0, 30) * 24 * 60 * 60 * 1000);
      cancelReason = pick([
        'Khách hàng yêu cầu hủy',
        'Hết hàng do lỗi đối tác',
        'Thanh toán thất bại',
        'Đơn trùng lặp',
        'Voucher đã hết hạn trước khi phát hành',
      ]);
    } else if (statusKind === 'PaidRefunded') {
      paymentStatus = 'Paid';
      refundedAt = new Date(now - randInt(0, 10) * 24 * 60 * 60 * 1000);
      refundAmount = totalSoFar;
      refundReason = pick([
        'Khách yêu cầu hủy trong vòng 24h',
        'Lỗi đối tác - hoàn toàn phần',
        'Trùng đơn đã thanh toán',
      ]);
    }

    orderPlans.push({
      customerId: customer.userId,
      paymentMethod,
      paymentStatus,
      cancelledAt,
      cancelReason,
      refundedAt,
      refundAmount,
      refundReason,
      isGift,
      receiverEmail: isGift ? `gift${i}@recipient.example.com` : undefined,
      giftMessage: isGift ? 'Chúc bạn một ngày tốt lành!' : undefined,
      vouchers: selectedVouchers,
      daysAgo,
    });
  }

  let created = 0;
  for (const plan of orderPlans) {
    await createOrder(plan);
    created++;
  }

  console.log(`Done! Created ${created} orders.`);
  console.log(`  - Pending: ${orderPlans.filter(o => o.paymentStatus === 'Pending').length}`);
  console.log(`  - Paid: ${orderPlans.filter(o => o.paymentStatus === 'Paid').length}`);
  console.log(`  - Cancelled: ${orderPlans.filter(o => o.paymentStatus === 'Cancelled').length}`);
  console.log(`  - Refunded: ${orderPlans.filter(o => o.refundedAt).length}`);
  console.log(`  - Gift: ${orderPlans.filter(o => o.isGift).length}`);
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());