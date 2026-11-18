import { describe, expect, it } from "vitest";
import {
  calculateWorkMinutes,
  countWorkingDaysInMonth,
  evaluateCheckInStatus,
} from "@/lib/utils/business-rules";

describe("BR-01 / BR-02 / BR-03 Absensi (Sprint 1)", () => {
  it("menandai HADIR sebelum/tepat batas toleransi WIB dan TERLAMBAT sesudahnya", () => {
    const onTime = new Date("2026-11-16T01:15:00.000Z");
    const late = new Date("2026-11-16T01:16:00.000Z");
    expect(evaluateCheckInStatus(onTime, "08:00", 15)).toBe("HADIR");
    expect(evaluateCheckInStatus(late, "08:00", 15)).toBe("TERLAMBAT");
  });

  it("menghitung durasi kerja dalam menit", () => {
    const start = new Date("2026-11-16T01:00:00.000Z");
    const end = new Date("2026-11-16T10:30:00.000Z");
    expect(calculateWorkMinutes(start, end)).toBe(570);
  });

  it("menghitung hari kerja berjalan dalam sebulan untuk perhitungan alpa", () => {
    const cutoff = new Date("2026-11-07T05:00:00.000Z");
    expect(countWorkingDaysInMonth(2026, 11, "1,2,3,4,5,6", cutoff)).toBe(6);
  });
});
