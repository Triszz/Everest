import { Request, Response } from 'express';
import { ZodError } from 'zod';
import { voucherService } from './voucher.service';
import { asyncHandler } from '../../middlewares/asyncHandler';
import { AppError } from '../../middlewares/errorHandler';
import { createVoucherSchema, updateVoucherSchema, voucherQuerySchema } from './voucher.schemas';

const requirePartnerId = (req: Request) => {
    if (!req.user?.partnerId) throw new AppError('Không tìm thấy thông tin đối tác', 403, 'FORBIDDEN');
    return req.user.partnerId;
};

const parse = <T>(schema: { parse: (v: unknown) => T }, value: unknown): T => {
    try {
        return schema.parse(value);
    } catch (err) {
        if (err instanceof ZodError) throw new AppError(err.issues[0].message, 400, 'VALIDATION_ERROR');
        throw err;
    }
};

export const voucherController = {
    list: asyncHandler(async (req: Request, res: Response) => {
        const query = parse(voucherQuerySchema, req.query);
        const result = await voucherService.list(requirePartnerId(req), query);
        res.json({ success: true, ...result }); // spread: { data, pagination }
    }),

    create: asyncHandler(async (req: Request, res: Response) => {
        const input = parse(createVoucherSchema, req.body);
        const data = await voucherService.create(requirePartnerId(req), input);
        res.status(201).json({ success: true, data });
    }),

    getById: asyncHandler(async (req: Request, res: Response) => {
        const voucherId = parseInt(req.params.voucherId as string);
        const data = await voucherService.getById(voucherId, requirePartnerId(req));
        res.json({ success: true, data });
    }),

    update: asyncHandler(async (req: Request, res: Response) => {
        const voucherId = parseInt(req.params.voucherId as string);
        const input = parse(updateVoucherSchema, req.body);
        const data = await voucherService.update(voucherId, requirePartnerId(req), input);
        res.json({ success: true, data });
    }),

    submit: asyncHandler(async (req: Request, res: Response) => {
        const voucherId = parseInt(req.params.voucherId as string);
        const data = await voucherService.submit(voucherId, requirePartnerId(req));
        res.json({ success: true, data, message: 'Đã gửi voucher lên chờ Admin duyệt' });
    }),

    delete: asyncHandler(async (req: Request, res: Response) => {
        const voucherId = parseInt(req.params.voucherId as string);
        await voucherService.delete(voucherId, requirePartnerId(req));
        res.json({ success: true, data: null, message: 'Xóa voucher thành công' });
    }),
};