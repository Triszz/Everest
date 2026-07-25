import { z } from "zod";

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
