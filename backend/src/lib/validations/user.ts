import { z } from "zod";

export const roleEnum = z.enum(["OWNER", "ADMIN", "PRODUCTION"]);

export const createUserSchema = z.object({
  name: z.string().trim().min(2, "Nama minimal 2 karakter").max(100),
  email: z.string().trim().email("Format email tidak valid").toLowerCase(),
  password: z.string().min(6, "Password minimal 6 karakter").max(100),
  role: roleEnum,
  phone: z.string().trim().max(25).optional().or(z.literal("")),
});

export const updateUserSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(2, "Nama minimal 2 karakter").max(100),
  email: z.string().trim().email("Format email tidak valid").toLowerCase(),
  role: roleEnum,
  phone: z.string().trim().max(25).optional().or(z.literal("")),
  isActive: z.boolean(),
});

export const resetPasswordSchema = z.object({
  id: z.string().min(1),
  newPassword: z.string().min(6, "Password baru minimal 6 karakter").max(100),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
