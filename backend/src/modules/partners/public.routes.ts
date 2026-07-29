import { Router } from 'express';
import { prisma } from '../../config/prisma';
import { asyncHandler } from '../../middlewares/asyncHandler';

const router = Router();

// GET /api/public/partners — danh sách đối tác đã duyệt (cho filter dropdown)
// Không cần auth
router.get('/', asyncHandler(async (_req, res) => {
    const partners = await prisma.partner.findMany({
        where: { status: 'Approved' },
        select: {
            partnerId: true,
            companyName: true,
        },
        orderBy: { companyName: 'asc' },
    });
    res.json({ success: true, data: partners });
}));

export default router;
