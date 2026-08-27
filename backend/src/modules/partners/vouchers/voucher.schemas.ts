import { z } from 'zod';

export const createVoucherSchema = z.object({
    title: z.string().min(5, 'Tên voucher ít nhất 5 ký tự').max(255),
    description: z.string().optional(),
    categoryId: z.number().int().positive('Danh mục không hợp lệ'),
    originalPrice: z.number().positive('Giá gốc phải lớn hơn 0'),
    salePrice: z.number().positive('Giá bán phải lớn hơn 0'),
    applicationCondition: z.string().optional(),
    totalQuantity: z.number().int().positive('Số lượng phải lớn hơn 0'),
    imageUrl: z.string().optional(),
    startDate: z.iso.datetime('Ngày bắt đầu không hợp lệ'),
    endDate: z.iso.datetime('Ngày kết thúc không hợp lệ'),
    expiryDays: z.number().int().positive('Số ngày hiệu lực phải lớn hơn 0'),
    // BR-PAR-02: Voucher phải gán với ít nhất 1 chi nhánh của partner.
    // Voucher "không gán branch" = không có branch áp dụng → redemption fail.
    branchIds: z
        .array(z.number().int().positive('Chi nhánh không hợp lệ'))
        .min(1, 'Voucher phải gán với ít nhất 1 chi nhánh của partner'),
})
    .refine((d) => d.salePrice < d.originalPrice, {
        message: 'Giá bán phải nhỏ hơn giá gốc',
        path: ['salePrice'],
    })
    .refine((d) => new Date(d.endDate) > new Date(d.startDate), {
        message: 'Ngày kết thúc phải sau ngày bắt đầu',
        path: ['endDate'],
    });

// Tất cả fields optional cho update — nhưng branchIds nếu gửi phải có ≥ 1 phần tử.
export const updateVoucherSchema = z.object({
    title: z.string().min(5).max(255).optional(),
    description: z.string().optional().nullable(),
    categoryId: z.number().int().positive('Danh mục không hợp lệ').optional(),
    originalPrice: z.number().positive('Giá gốc phải lớn hơn 0').optional(),
    salePrice: z.number().positive('Giá bán phải lớn hơn 0').optional(),
    applicationCondition: z.string().optional().nullable(),
    totalQuantity: z.number().int().positive('Số lượng phải lớn hơn 0').optional(),
    imageUrl: z.string().optional().nullable(),
    startDate: z.iso.datetime().optional(),
    endDate: z.iso.datetime().optional(),
    expiryDays: z.number().int().positive().optional(),
    // BR-PAR-04: nếu partner thay đổi branchIds, phải chọn ≥ 1 chi nhánh.
    // Cho phép undefined (không thay đổi), nhưng không cho phép [] rỗng.
    branchIds: z
        .array(z.number().int().positive('Chi nhánh không hợp lệ'))
        .min(1, 'Voucher phải gán với ít nhất 1 chi nhánh của partner')
        .optional(),
});

export const voucherQuerySchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    status: z.enum(['Draft', 'Pending', 'Approved', 'Rejected']).optional(),
    q: z.string().optional(),
});

// Bật/tắt hiển thị voucher — chỉ áp dụng khi voucher đã được admin duyệt.
// Đây là action kinh doanh của partner, không phải duyệt nội dung.
export const toggleVoucherDisplaySchema = z.object({
    displayStatus: z.enum(['Visible', 'Hidden'], {
        message: 'displayStatus phải là Visible hoặc Hidden',
    }),
});

export type CreateVoucherInput = z.infer<typeof createVoucherSchema>;
export type UpdateVoucherInput = z.infer<typeof updateVoucherSchema>;
export type VoucherQuery = z.infer<typeof voucherQuerySchema>;
export type ToggleVoucherDisplayInput = z.infer<typeof toggleVoucherDisplaySchema>;