import { z } from "zod";

export const leaveStatusEnum = z.enum(["IZIN", "SAKIT", "CUTI"]);

export const setLeaveSchema = z.object({
  userId: z.string().min(1, "Pilih karyawan"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal harus YYYY-MM-DD"),
  status: leaveStatusEnum,
  note: z.string().trim().min(3, "Catatan alasan wajib diisi (min 3 karakter)").max(300),
});

export const workSettingsSchema = z.object({
  workStartTime: z.string().regex(/^\d{2}:\d{2}$/, "Format jam HH:MM"),
  lateToleranceMin: z.coerce.number().int().min(0).max(180),
  workEndTime: z.string().regex(/^\d{2}:\d{2}$/, "Format jam HH:MM"),
});

export type SetLeaveInput = z.infer<typeof setLeaveSchema>;
export type WorkSettingsInput = z.infer<typeof workSettingsSchema>;
