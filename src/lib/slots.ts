export type Slot = { id: string; label: string; start: string; end: string; hint: string };

export const DAY_NAMES = ["Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy", "Chủ Nhật"];

export const WEEKDAY_SLOTS: Slot[] = [
  { id: "sang", label: "Buổi sáng", start: "09:30", end: "11:30", hint: "2 tiếng · 5 tuổi trở lên" },
  { id: "chieu1", label: "Buổi chiều", start: "14:30", end: "16:30", hint: "2 tiếng · 5 tuổi trở lên" },
  { id: "chieu2", label: "Buổi chiều", start: "16:00", end: "18:00", hint: "2 tiếng · 5 tuổi trở lên" },
  { id: "toi", label: "Buổi tối", start: "18:30", end: "20:30", hint: "2 tiếng · 5 tuổi trở lên" },
];

export const WEEKEND_SLOTS: Slot[] = [
  { id: "sang1", label: "Buổi sáng", start: "07:30", end: "09:30", hint: "2 tiếng · 5 tuổi trở lên" },
  { id: "sang2", label: "Buổi sáng", start: "09:30", end: "11:30", hint: "2 tiếng · 5 tuổi trở lên" },
  { id: "chieu1", label: "Buổi chiều", start: "14:30", end: "16:30", hint: "2 tiếng · 5 tuổi trở lên" },
  { id: "chieu2", label: "Buổi chiều", start: "16:00", end: "18:00", hint: "2 tiếng · 5 tuổi trở lên" },
];

export function isWeekend(dow: number) {
  return dow === 6 || dow === 0;
}

export function slotsForDow(dow: number): Slot[] {
  return isWeekend(dow) ? WEEKEND_SLOTS : WEEKDAY_SLOTS;
}

export function findSlotMeta(dateISO: string, slotId: string): Slot | null {
  const dow = new Date(dateISO + "T00:00:00").getDay();
  return slotsForDow(dow).find((s) => s.id === slotId) || null;
}

function pad(n: number) {
  return n < 10 ? "0" + n : "" + n;
}

export function toISO(d: Date) {
  return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
}

export function sameDate(a: Date, b: Date) {
  return toISO(a) === toISO(b);
}

export function startOfWeek(d: Date) {
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const m = new Date(d);
  m.setDate(d.getDate() + diff);
  m.setHours(0, 0, 0, 0);
  return m;
}

export function addDays(d: Date, n: number) {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

export function fmtShort(d: Date) {
  return pad(d.getDate()) + "/" + pad(d.getMonth() + 1);
}

export function dayNameFor(dateISO: string) {
  const dow = new Date(dateISO + "T00:00:00").getDay();
  return DAY_NAMES[(dow + 6) % 7];
}

export function stripDiacritics(s: string) {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "");
}
