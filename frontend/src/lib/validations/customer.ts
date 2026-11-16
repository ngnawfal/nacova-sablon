import { z } from "zod";

export const customerSchema = z.object({
  name: z.string().trim().min(2, "Nama pelanggan minimal 2 karakter").max(120),
  phone: z.string().trim().min(8, "No. HP minimal 8 digit").max(25),
  company: z.string().trim().max(120).optional().or(z.literal("")),
  address: z.string().trim().max(500).optional().or(z.literal("")),
  notes: z.string().trim().max(500).optional().or(z.literal("")),
});

export const updateCustomerSchema = customerSchema.extend({
  id: z.string().min(1),
});

export type CustomerInput = z.infer<typeof customerSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
