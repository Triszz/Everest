import { Router } from 'express';
import { prisma } from '../../../config/prisma';

const router = Router();

// ── BR-CUS-03: Search & Filter ────────────────────────────────────────────────

// GET /api/customer/search/partners — danh sách đối tác cho filter dropdown
router.get('/partners', async (_req, res) => {
    const partners = await prisma.partner.findMany({
        where: { status: 'Approved' },
        select: {
            partnerId: true,
            companyName: true,
            _count: {
                select: {
                    vouchers: {
                        where: { approvalStatus: 'Approved' },
                    },
                },
            },
        },
        orderBy: { companyName: 'asc' },
    });

    // Gộp duplicate companyName, cộng dồn voucher count
    const mergedMap = new Map<string, { partnerId: number; companyName: string; voucherCount: number }>();
    for (const p of partners) {
        const key = p.companyName.trim().toLowerCase();
        if (mergedMap.has(key)) {
            mergedMap.get(key)!.voucherCount += p._count.vouchers;
        } else {
            mergedMap.set(key, {
                partnerId: p.partnerId,
                companyName: p.companyName.trim(),
                voucherCount: p._count.vouchers,
            });
        }
    }

    const data = Array.from(mergedMap.values())
        .sort((a, b) => a.companyName.localeCompare(b.companyName, 'vi'));

    res.json({ success: true, data });
});

export default router;
