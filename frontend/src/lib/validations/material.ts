import { z } from "zod";

export const supplierSchema = z.object({
  name: z.string().trim().min(2, "Nama supplier minimal 2 karakter").max(120),
  phone: z.string().trim().max(25).optional().or(z.literal("")),
  address: z.string().trim().max(300).optional().or(z.literal("")),
  notes: z.string().trim().max(300).optional().or(z.literal("")),
});

export const materialSchema = z.object({
  name: z.string().trim().min(2, "Nama bahan minimal 2 karakter").max(120),
  sku: z.string().trim().max(50).optional().or(z.literal("")),
  category: z.string().trim().min(2, "Kategori wajib diisi").max(60),
  unit: z.string().trim().min(1, "Satuan wajib diisi").max(30),
  minStock: z.coerce.number().min(0, "Stok minimum tidak boleh negatif"),
  supplierId: z.string().optional().or(z.literal("")),
});

export const updateMaterialSchema = materialSchema.extend({
  id: z.string().min(1),
});

export const stockMutationSchema = z.object({
  materialId: z.string().min(1, "Pilih bahan"),
  qty: z.coerce.number().positive("Jumlah mutasi harus lebih dari 0"),
  reason: z.string().trim().max(300).optional().or(z.literal("")),
  reference: z.string().trim().max(120).optional().or(z.literal("")),
});

export const stockOpnameSchema = z.object({
  materialId: z.string().min(1, "Pilih bahan"),
  actualStock: z.coerce.number().min(0, "Stok fisik tidak boleh negatif"),
  reason: z.string().trim().min(3, "Alasan stock opname wajib diisi").max(300),
});

export type SupplierInput = z.infer<typeof supplierSchema>;
export type MaterialInput = z.infer<typeof materialSchema>;
export type StockMutationInput = z.infer<typeof stockMutationSchema>;
export type StockOpnameInput = z.infer<typeof stockOpnameSchema>;
