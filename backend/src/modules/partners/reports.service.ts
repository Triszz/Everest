import { prisma } from "../../config/prisma";
import type { Prisma } from "../../generated/prisma/client";

// ── Date range helper ──────────────────────────────────────────────────────────
function buildDateRange(params: {
  datePreset?: string;
  fromDate?: string;
  toDate?: string;
}): { gte: Date; lte: Date } {
  const now = new Date();
  let gte: Date;
  let lte: Date = new Date(now);

  if (params.fromDate && params.toDate) {
    gte = new Date(params.fromDate);
    lte = new Date(params.toDate);
    // Include the entire end-of-day
    lte.setHours(23, 59, 59, 999);
    return { gte, lte };
  }

  switch (params.datePreset) {
    case "today":
      gte = new Date(now);
      gte.setHours(0, 0, 0, 0);
      break;
    case "last7days": {
      gte = new Date(now);
      gte.setDate(gte.getDate() - 6);
      gte.setHours(0, 0, 0, 0);
      break;
    }
    case "last30days": {
      gte = new Date(now);
      gte.setDate(gte.getDate() - 29);
      gte.setHours(0, 0, 0, 0);
      break;
    }
    case "last90days": {
      gte = new Date(now);
      gte.setDate(gte.getDate() - 89);
      gte.setHours(0, 0, 0, 0);
      break;
    }
    case "thisYear": {
      gte = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
      break;
    }
    default: {
      // last30days as default
      gte = new Date(now);
      gte.setDate(gte.getDate() - 29);
      gte.setHours(0, 0, 0, 0);
    }
  }

  return { gte, lte };
}

// ── KPI filters base: snapshot scope + event date conditions ─────────────────
//
// Dashboard widgets are split into two groups:
//
//   • SNAPSHOT metrics — reflect the current state of the Partner's catalogue.
//     These do NOT depend on the date filter. They use `snapshotVoucherScope`
//     which is only restricted by partnerId (+ optional voucherId / search).
//     Examples: Tổng voucher, Đã phát hành, Voucher Status pie, Voucher Table,
//     Voucher Performance list.
//
//   • EVENT metrics — count business events that happened in the date window.
//     These use `orderDateCondition` (`Order.createdAt`) for sales/revenue,
//     and `issuedUsedDateCondition` (`IssuedVoucher.usedAt`) for redemptions.
//     Examples: Total Sold, Revenue, Total Used, Usage Rate, Revenue Chart,
//     Issued-Voucher Status pie.
//
// `voucherIds` returned below is the SNAPSHOT set — used to scope event
// counts so they only attribute to the Partner's current catalogue (a sale
// of a voucher that has since been deleted is excluded; sales of currently
// active vouchers are kept regardless of when the voucher itself was created).
async function buildReportFilters(
  partnerId: number,
  params: {
    datePreset?: string;
    fromDate?: string;
    toDate?: string;
    voucherId?: number | null;
    branchId?: number | null;
  },
) {
  const { gte, lte } = buildDateRange(params);

  // 1. Partners' branches (for branch-scoped issued-voucher queries)
  const branches = await prisma.branch.findMany({
    where: { partnerId },
    select: { branchId: true },
  });
  const branchIds = branches.map((b) => b.branchId);

  // 2. SNAPSHOT scope — current catalogue of the Partner. No time filter.
  //    Used by snapshot widgets (Status pie, Table, Performance list).
  const snapshotVoucherScope: Prisma.VoucherWhereInput = {
    partnerId,
    ...(params.voucherId ? { voucherId: params.voucherId } : {}),
  };
  const snapshotVouchers = await prisma.voucher.findMany({
    where: snapshotVoucherScope,
    select: { voucherId: true },
  });
  const snapshotVoucherIds = snapshotVouchers.map((v) => v.voucherId);

  // 3. EVENT date conditions.
  //    • `orderDateCondition` for sales/revenue (Order.createdAt).
  //    • `issuedUsedDateCondition` for redemptions (IssuedVoucher.usedAt).
  //    Both also restricted to `snapshotVoucherIds` so events for vouchers
  //    no longer in the catalogue are not attributed to this Partner.
  const orderDateCondition: Prisma.OrderWhereInput["createdAt"] = { gte, lte };
  const issuedUsedDateCondition: Prisma.IssuedVoucherWhereInput["usedAt"] = {
    not: null,
    gte,
    lte,
  };

  // 4. Per-voucher filter (when user picks a specific voucher on the UI)
  const voucherCondition = params.voucherId
    ? { voucherId: params.voucherId }
    : {};

  // 5. Per-branch filter (when user picks a specific branch on the UI)
  const branchCondition = params.branchId
    ? { usedAtBranchId: params.branchId }
    : {};

  return {
    snapshotVoucherIds,
    branchIds,
    snapshotVoucherScope,
    orderDateCondition,
    issuedUsedDateCondition,
    voucherCondition,
    branchCondition,
    dateRange: { gte, lte },
  };
}

// ── 1. KPIs ────────────────────────────────────────────────────────────────────
export async function getPartnerKPIs(
  partnerId: number,
  params: {
    datePreset?: string;
    fromDate?: string;
    toDate?: string;
    voucherId?: number | null;
    branchId?: number | null;
  },
) {
  const {
    snapshotVoucherIds,
    branchIds,
    snapshotVoucherScope,
    orderDateCondition,
    issuedUsedDateCondition,
  } = await buildReportFilters(partnerId, params);

  const [totalIssued, totalSoldRaw, totalUsedRaw, revenueRaw] =
    await Promise.all([
      // SNAPSHOT — Tổng voucher đã phát hành hiện tại của Partner.
      // Không filter theo Voucher.createdAt. Approved + Visible = đang được đăng bán.
      prisma.voucher.count({
        where: {
          ...snapshotVoucherScope,
          approvalStatus: "Approved",
          displayStatus: "Visible",
        },
      }),

      // EVENT — Đã bán: tổng quantity của OrderItem thuộc Order có
      // paymentStatus=Paid, createdAt ∈ range, và Voucher ∈ snapshot set.
      prisma.orderItem.aggregate({
        where: {
          voucherId: { in: snapshotVoucherIds },
          order: {
            paymentStatus: "Paid",
            createdAt: orderDateCondition,
            ...(params.voucherId
              ? { items: { some: { voucherId: params.voucherId } } }
              : {}),
          },
        },
        _sum: { quantity: true },
      }),

      // EVENT — Đã sử dụng: count IssuedVoucher có Voucher ∈ snapshot set
      // và usedAt ∈ range (chỉ tính những issued voucher đã thực sự dùng).
      prisma.issuedVoucher.count({
        where: {
          orderItem: { voucherId: { in: snapshotVoucherIds } },
          status: "Used",
          usedAt: issuedUsedDateCondition,
          ...(params.branchId
            ? { usedAtBranchId: { in: branchIds } }
            : {}),
        },
      }),

      // EVENT — Doanh thu: tổng OrderItem.price của Order trong range + Voucher ∈ set.
      prisma.orderItem.aggregate({
        where: {
          voucherId: { in: snapshotVoucherIds },
          order: {
            paymentStatus: "Paid",
            createdAt: orderDateCondition,
          },
        },
        _sum: { price: true },
      }),
    ]);

  const totalSold = totalSoldRaw._sum.quantity ?? 0;
  const totalUsed = totalUsedRaw;
  const revenue = revenueRaw._sum.price
    ? Number(revenueRaw._sum.price)
    : 0;
  const usageRate =
    totalSold > 0 ? Math.round((totalUsed / totalSold) * 10000) / 100 : 0;

  return {
    totalIssued,
    totalSold,
    totalUsed,
    revenue,
    usageRate,
  };
}

// ── 2. Revenue chart ───────────────────────────────────────────────────────────
export async function getRevenueChart(
  partnerId: number,
  params: {
    datePreset?: string;
    fromDate?: string;
    toDate?: string;
    granularity: "day" | "week" | "month";
    voucherId?: number | null;
    branchId?: number | null;
  },
) {
  const { snapshotVoucherIds, orderDateCondition } =
    await buildReportFilters(partnerId, params);

  const orders = await prisma.order.findMany({
    where: {
      paymentStatus: "Paid",
      createdAt: orderDateCondition,
      orderItems: {
        some: { voucherId: { in: snapshotVoucherIds } },
      },
    },
    select: {
      createdAt: true,
      orderItems: {
        select: { voucherId: true, price: true, quantity: true },
        where: { voucherId: { in: snapshotVoucherIds } },
      },
    },
  });

  // Tính revenue theo nhóm ngày/tuần/tháng
  const series: Record<string, number> = {};

  for (const order of orders) {
    const d = new Date(order.createdAt);
    let key: string;
    switch (params.granularity) {
      case "day":
        key = d.toISOString().slice(0, 10);
        break;
      case "week": {
        // Lấy ngày đầu tuần (Thứ 2)
        const day = d.getDay();
        const diff = (day === 0 ? -6 : 1 - day);
        const monday = new Date(d);
        monday.setDate(d.getDate() + diff);
        key = monday.toISOString().slice(0, 10);
        break;
      }
      case "month":
        key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        break;
    }
    const orderRevenue = order.orderItems.reduce(
      (sum, item) => sum + Number(item.price) * item.quantity,
      0,
    );
    series[key] = (series[key] ?? 0) + orderRevenue;
  }

  // Convert sang array và sort theo ngày
  const data = Object.entries(series)
    .map(([date, revenue]) => ({ date, revenue: Math.round(revenue) }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return { granularity: params.granularity, data };
}

// ── 3. Voucher performance (top sold) ────────────────────────────────────────
export async function getVoucherPerformance(
  partnerId: number,
  params: {
    datePreset?: string;
    fromDate?: string;
    toDate?: string;
    limit: number;
    branchId?: number | null;
  },
) {
  const {
    snapshotVoucherIds,
    snapshotVoucherScope,
    orderDateCondition,
    branchIds,
    issuedUsedDateCondition,
  } = await buildReportFilters(partnerId, params);

  // SNAPSHOT — liệt kê tất cả voucher hiện tại của Partner. Không filter
  // theo Voucher.createdAt. (Top-N theo `limit` sau khi tính sold.)
  const vouchers = await prisma.voucher.findMany({
    where: snapshotVoucherScope,
    select: { voucherId: true, title: true },
  });

  // EVENT — sold/used counts trong khoảng thời gian đang chọn.
  const [soldCounts, usedCounts] = await Promise.all([
    prisma.orderItem.groupBy({
      by: ["voucherId"],
      where: {
        voucherId: { in: snapshotVoucherIds },
        order: {
          paymentStatus: "Paid",
          createdAt: orderDateCondition,
        },
      },
      _sum: { quantity: true },
    }),
    prisma.issuedVoucher.groupBy({
      by: ["orderItemId"],
      where: {
        orderItem: { voucherId: { in: snapshotVoucherIds } },
        usedAt: issuedUsedDateCondition,
        status: "Used",
        ...(params.branchId
          ? { usedAtBranchId: { in: branchIds } }
          : {}),
      },
    }),
  ]);

  // Map orderItemId -> usedCount, rồi resolve orderItemId → voucherId
  const usedByOrderItemId: Record<number, number> = {};
  for (const item of usedCounts) {
    usedByOrderItemId[item.orderItemId] =
      (usedByOrderItemId[item.orderItemId] ?? 0) + 1;
  }
  // Cần resolve orderItemId → voucherId thông qua OrderItem đã chọn ở trên,
  // nhưng groupBy trên issuedVoucher không có sẵn voucherId. Thực hiện
  // một query phụ nhỏ để map.
  const orderItems = await prisma.orderItem.findMany({
    where: { orderItemId: { in: Object.keys(usedByOrderItemId).map(Number) } },
    select: { orderItemId: true, voucherId: true },
  });
  const usedByVoucherId: Record<number, number> = {};
  for (const oi of orderItems) {
    usedByVoucherId[oi.voucherId] =
      (usedByVoucherId[oi.voucherId] ?? 0) +
      (usedByOrderItemId[oi.orderItemId] ?? 0);
  }

  // Build data
  const data = vouchers.map((v) => {
    const sold = soldCounts.find((s) => s.voucherId === v.voucherId)?._sum.quantity ?? 0;
    const used = usedByVoucherId[v.voucherId] ?? 0;
    return {
      voucherId: v.voucherId,
      title: v.title,
      sold,
      used,
      usageRate: sold > 0 ? Math.round((used / sold) * 10000) / 100 : 0,
    };
  });

  // Sort by sold desc, take top N
  const sorted = data
    .sort((a, b) => b.sold - a.sold)
    .slice(0, params.limit);

  return { data: sorted };
}

// ── 4. Voucher status distribution ──────────────────────────────────────────
export async function getVoucherStatusDistribution(
  partnerId: number,
  params: {
    datePreset?: string;
    fromDate?: string;
    toDate?: string;
    branchId?: number | null;
  },
) {
  const {
    snapshotVoucherIds,
    branchIds,
    snapshotVoucherScope,
    issuedUsedDateCondition,
  } = await buildReportFilters(partnerId, params);

  const [voucherCounts, issuedStatusCounts] = await Promise.all([
    // SNAPSHOT — groupBy approvalStatus trên tập voucher hiện tại.
    // Không filter theo Voucher.createdAt: pie chart phản ánh tình trạng
    // hiện tại của Partner (catalog đang có gì).
    prisma.voucher.groupBy({
      by: ["approvalStatus"],
      where: snapshotVoucherScope,
      _count: { approvalStatus: true },
    }),

    // EVENT — groupBy status của IssuedVoucher trong khoảng thời gian.
    // Scope:
    //   • Voucher ∈ snapshot set
    //   • usedAt ∈ range (khoảng ngày lọc, chỉ những issued voucher đã dùng)
    prisma.issuedVoucher.groupBy({
      by: ["status"],
      where: {
        orderItem: { voucherId: { in: snapshotVoucherIds } },
        usedAt: issuedUsedDateCondition,
        ...(params.branchId ? { usedAtBranchId: { in: branchIds } } : {}),
      },
      _count: { status: true },
    }),
  ]);

  const data = [
    // Voucher approval statuses
    ...voucherCounts.map((v) => ({
      label: approvalStatusLabel(v.approvalStatus as string),
      count: v._count.approvalStatus,
      type: "voucher" as const,
    })),
    // Issued voucher usage statuses
    ...issuedStatusCounts.map((v) => ({
      label: usageStatusLabel(v.status as string),
      count: v._count.status,
      type: "issued" as const,
    })),
  ];

  return { data };
}

function approvalStatusLabel(status: string): string {
  const map: Record<string, string> = {
    Draft: "Bản nháp",
    Pending: "Chờ duyệt",
    Approved: "Đã duyệt",
    Rejected: "Từ chối",
  };
  return map[status] ?? status;
}

function usageStatusLabel(status: string): string {
  const map: Record<string, string> = {
    Unused: "Chưa sử dụng",
    Used: "Đã sử dụng",
    Expired: "Hết hạn",
    Locked: "Đã khóa",
  };
  return map[status] ?? status;
}

// ── 5. Voucher detail table ───────────────────────────────────────────────────
export async function getVoucherReportTable(
  partnerId: number,
  params: {
    datePreset?: string;
    fromDate?: string;
    toDate?: string;
    page: number;
    limit: number;
    sortBy:
      | "title"
      | "issued"
      | "sold"
      | "used"
      | "revenue"
      | "usageRate"
      | "status";
    sortOrder: "asc" | "desc";
    search?: string;
    voucherId?: number | null;
    branchId?: number | null;
  },
) {
  const {
    snapshotVoucherIds,
    snapshotVoucherScope,
    orderDateCondition,
    issuedUsedDateCondition,
  } = await buildReportFilters(partnerId, params);

  // Pagination
  const skip = (params.page - 1) * params.limit;

  // Where clause: tập snapshot + search. Không filter theo Voucher.createdAt.
  const searchFilter: Prisma.VoucherWhereInput = params.search
    ? { title: { contains: params.search, mode: "insensitive" } }
    : {};

  // Đếm tổng trong tập snapshot
  const total = await prisma.voucher.count({
    where: { ...snapshotVoucherScope, ...searchFilter },
  });

  // Sort field mapping
  type VoucherOrderBy = Prisma.VoucherOrderByWithRelationInput;
  let orderBy: VoucherOrderBy = { createdAt: params.sortOrder };

  // Lấy vouchers với pagination — toàn bộ snapshot (không filter theo ngày)
  const vouchers = await prisma.voucher.findMany({
    where: { ...snapshotVoucherScope, ...searchFilter },
    skip,
    take: params.limit,
    orderBy,
    select: {
      voucherId: true,
      title: true,
      approvalStatus: true,
      displayStatus: true,
      createdAt: true,
    },
  });

  if (vouchers.length === 0) {
    return { data: [], pagination: { total, page: params.page, limit: params.limit } };
  }

  const vidIds = vouchers.map((v) => v.voucherId);

  // Aggregate sold + used trong khoảng thời gian đang chọn (event metric).
  // • Sold: OrderItem ∋ Voucher ∈ vidIds, Order.createdAt ∈ range, paymentStatus=Paid
  // • Used: IssuedVoucher.usedAt ∈ range, status=Used, thuộc Voucher ∈ vidIds.
  const [soldAgg, usedAgg] = await Promise.all([
    prisma.orderItem.groupBy({
      by: ["voucherId"],
      where: {
        voucherId: { in: vidIds },
        order: { paymentStatus: "Paid", createdAt: orderDateCondition },
      },
      _sum: { quantity: true },
    }),
    prisma.issuedVoucher.groupBy({
      by: ["orderItemId"],
      where: {
        orderItem: { voucherId: { in: vidIds } },
        usedAt: issuedUsedDateCondition,
        status: "Used",
      },
    }),
  ]);

  const soldMap: Record<number, number> = {};
  for (const s of soldAgg) {
    soldMap[s.voucherId] = s._sum.quantity ?? 0;
  }

  // used: key by orderItemId, resolve orderItemId → voucherId
  const usedByOrderItemId: Record<number, number> = {};
  for (const u of usedAgg) {
    usedByOrderItemId[u.orderItemId] = (usedByOrderItemId[u.orderItemId] ?? 0) + 1;
  }
  const orderItemsForUsed = await prisma.orderItem.findMany({
    where: { orderItemId: { in: Object.keys(usedByOrderItemId).map(Number) } },
    select: { orderItemId: true, voucherId: true },
  });
  const usedMap: Record<number, number> = {};
  for (const oi of orderItemsForUsed) {
    usedMap[oi.voucherId] =
      (usedMap[oi.voucherId] ?? 0) + (usedByOrderItemId[oi.orderItemId] ?? 0);
  }

  // Build data rows
  let rows = vouchers.map((v) => {
    const sold = soldMap[v.voucherId] ?? 0;
    const used = usedMap[v.voucherId] ?? 0;
    const usageRate = sold > 0 ? Math.round((used / sold) * 10000) / 100 : 0;
    return {
      voucherId: v.voucherId,
      title: v.title,
      issued: v.approvalStatus === "Approved" && v.displayStatus === "Visible" ? 1 : 0, // đã phát hành = đã approved + đang hiển thị
      sold,
      used,
      usageRate,
      status: v.approvalStatus,
      createdAt: v.createdAt.toISOString(),
    };
  });

  // Sort rows
  const sortDir = params.sortOrder === "asc" ? 1 : -1;
  rows = rows.sort((a, b) => {
    switch (params.sortBy) {
      case "title":
        return a.title.localeCompare(b.title) * sortDir;
      case "sold":
        return (a.sold - b.sold) * sortDir;
      case "used":
        return (a.used - b.used) * sortDir;
      case "usageRate":
        return (a.usageRate - b.usageRate) * sortDir;
      case "status":
        return a.status.localeCompare(b.status) * sortDir;
      default:
        return 0;
    }
  });

  return {
    data: rows,
    pagination: { total, page: params.page, limit: params.limit },
  };
}
