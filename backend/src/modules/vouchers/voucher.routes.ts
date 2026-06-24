import { Router } from 'express';
import { voucherController } from './voucher.controller';

// Middleware (authenticate + roleGuard) đã được apply từ partner.routes.ts
const router = Router();

router.get('/', voucherController.list);
router.post('/', voucherController.create);
router.get('/:voucherId', voucherController.getById);
router.put('/:voucherId', voucherController.update);
router.delete('/:voucherId', voucherController.delete);
router.post('/:voucherId/submit', voucherController.submit);

export default router;