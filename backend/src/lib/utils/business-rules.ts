import { getJakartaParts } from "./format.js";

export type RoleType = "OWNER" | "ADMIN" | "PRODUCTION";

export function parseTimeToMinutes(hhmm: string): number {
  const [hStr, mStr] = hhmm.split(":");
  const h = Number(hStr);
  const m = Number(mStr);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return 8 * 60;
  return h * 60 + m;
}

/**
 * BR-01: Determine HADIR vs TERLAMBAT based on Asia/Jakarta clock time vs work_start + tolerance.
 */
export function evaluateCheckInStatus(
  checkInAt: Date,
  workStartTime = "08:00",
  lateToleranceMin = 15
): "HADIR" | "TERLAMBAT" {
  const { hour, minute } = getJakartaParts(checkInAt);
  const checkInMinutes = hour * 60 + minute;
  const deadlineMinutes = parseTimeToMinutes(workStartTime) + lateToleranceMin;
  return checkInMinutes > deadlineMinutes ? "TERLAMBAT" : "HADIR";
}

/**
 * BR-02: Worked minutes between check-in and check-out.
 */
export function calculateWorkMinutes(checkInAt: Date, checkOutAt: Date): number {
  const diffMs = checkOutAt.getTime() - checkInAt.getTime();
  if (diffMs <= 0) return 0;
  return Math.floor(diffMs / 60000);
}

/**
 * BR-03: Count scheduled working days in (year, month 1..12) up to cutoffDate (inclusive).
 */
export function countWorkingDaysInMonth(
  year: number,
  month: number,
  workDaysCsv = "1,2,3,4,5,6",
  cutoffDate: Date = new Date()
): number {
  const allowed = new Set(
    workDaysCsv
      .split(",")
      .map((s) => Number(s.trim()))
      .filter((n) => Number.isInteger(n) && n >= 0 && n <= 6)
  );
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const { year: cy, month: cm, day: cd } = getJakartaParts(cutoffDate);

  let maxDay = daysInMonth;
  if (year > cy || (year === cy && month > cm)) {
    return 0;
  }
  if (year === cy && month === cm) {
    maxDay = Math.min(daysInMonth, cd);
  }

  let count = 0;
  for (let d = 1; d <= maxDay; d++) {
    const dayOfWeek = new Date(Date.UTC(year, month - 1, d)).getUTCDay();
    if (allowed.has(dayOfWeek)) count++;
  }
  return count;
}
