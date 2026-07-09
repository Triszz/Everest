import { z } from 'zod';

export const createVoucherSchema = z.object({
    title: z.string().min(5, 'Tên voucher ít nhất 5 ký tự').max(255),
    description: z.string().optional(),
    categoryId: z.number().int().positive('Danh mục không hợp lệ'),
    originalPrice: z.number().positive('Giá gốc phải lớn hơn 0'),
    salePrice: z.number().positive('Giá bán phải lớn hơn 0'),
    applicationCondition: z.string().optional(),
    totalQuantity: z.number().int().positive('Số lượng phải lớn hơn 0'),
    imageUrl: z.url('URL ảnh không hợp lệ').optional(),
    startDate: z.iso.datetime('Ngày bắt đầu không hợp lệ'),
    endDate: z.iso.datetime('Ngày kết thúc không hợp lệ'),
    expiryDays: z.number().int().positive('Số ngày hiệu lực phải lớn hơn 0'),
    branchIds: z.array(z.number().int().positive()).optional(),
})
    .refine((d) => d.salePrice < d.originalPrice, {
        message: 'Giá bán phải nhỏ hơn giá gốc',
        path: ['salePrice'],
    })
    .refine((d) => new Date(d.endDate) > new Date(d.startDate), {
        message: 'Ngày kết thúc phải sau ngày bắt đầu',
        path: ['endDate'],
    });

// Tất cả fields optional cho update
export const updateVoucherSchema = z.object({
    title: z.string().min(5).max(255).optional(),
    description: z.string().optional().nullable(),
    categoryId: z.number().int().positive('Danh mục không hợp lệ').optional(),
    originalPrice: z.number().positive('Giá gốc phải lớn hơn 0').optional(),
    salePrice: z.number().positive('Giá bán phải lớn hơn 0').optional(),
    applicationCondition: z.string().optional().nullable(),
    totalQuantity: z.number().int().positive('Số lượng phải lớn hơn 0').optional(),
    imageUrl: z.url().optional().nullable(),
    startDate: z.iso.datetime().optional(),
    endDate: z.iso.datetime().optional(),
    expiryDays: z.number().int().positive().optional(),
    branchIds: z.array(z.number().int().positive()).optional(),
});

export const voucherQuerySchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    status: z.enum(['Draft', 'Pending', 'Approved', 'Rejected']).optional(),
    q: z.string().optional(),
});

export type CreateVoucherInput = z.infer<typeof createVoucherSchema>;
export type UpdateVoucherInput = z.infer<typeof updateVoucherSchema>;
export type VoucherQuery = z.infer<typeof voucherQuerySchema>;