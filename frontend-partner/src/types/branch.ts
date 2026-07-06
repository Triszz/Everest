// ── Branch types (matching backend Prisma schema + service responses) ────────────

export interface BranchCashier {
  userId: string;
  fullName: string;
  email: string;
}

export interface Branch {
  branchId: number;
  partnerId: number;
  branchName: string;
  address: string;
  phoneNumber: string | null;
  cashier: BranchCashier | null;
  _count: {
    voucherBranches: number;
  };
  createdAt: string;
}

export interface BranchDetail extends Branch {
  voucherBranches: {
    voucher: {
      voucherId: number;
      title: string;
      description: string | null;
      imageUrl: string | null;
      originalPrice: string | number;
      salePrice: string | number;
      totalQuantity: number;
      availableQuantity: number;
      startDate: string;
      endDate: string;
      approvalStatus: string;
      displayStatus: string;
      category: { categoryId: number; categoryName: string };
    };
  }[];
}

// ── Create / Update payloads ─────────────────────────────────────────────────

export interface CreateBranchInput {
  branchName: string;
  address: string;
  phoneNumber?: string;
}

export interface UpdateBranchInput {
  branchName?: string;
  address?: string;
  phoneNumber?: string | null;
}

// ── Cashier ──────────────────────────────────────────────────────────────────

export interface CreateCashierInput {
  email: string;
  password: string;
  fullName: string;
  phoneNumber?: string;
  branchId?: number;
}

export interface CashierCreated {
  userId: string;
  email: string;
  fullName: string;
  role: string;
  status: string;
  partnerId: number;
  branchId: number | null;
}
