/**
 * Notification Schemas
 * --------------------------------------------------------------
 * Zod schemas cho Notification Preferences API + Notifications API.
 */
import { z } from "zod";

/** Body cho PUT /api/customer/notifications/preferences — cập nhật từng preference. */
export const updateNotificationsSchema = z.object({
  n1: z.boolean().optional(),
  n2: z.boolean().optional(),
  n3: z.boolean().optional(),
  n4: z.boolean().optional(),
  n5: z.boolean().optional(),
  n6: z.boolean().optional(),
  n7: z.boolean().optional(),
  n8: z.boolean().optional(),
  n9: z.boolean().optional(),
});

export type UpdateNotificationsInput = z.infer<typeof updateNotificationsSchema>;

/** Query cho GET /api/customer/notifications — phân trang */
export const notificationListSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  pageSize: z.coerce.number().int().positive().max(50).optional().default(20),
});

export type NotificationListInput = z.infer<typeof notificationListSchema>;