import { Router } from 'express';
import { asyncHandler } from '../../middlewares/asyncHandler';
import { prisma } from '../../config/prisma';

const router = Router();

// Public endpoint – không cần auth
router.get('/', asyncHandler(async (_req, res) => {
    const data = await prisma.category.findMany({
        orderBy: { categoryName: 'asc' },
    });
    res.json({ success: true, data });
}));

export default router;