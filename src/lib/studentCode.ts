import { stripDiacritics } from "@/lib/slots";
import type { Student } from "@/lib/types";

export function generateStudentCode(name: string, existing: Student[]): string {
  const letters = stripDiacritics(name).toUpperCase().replace(/[^A-Z]/g, "");
  const prefix = letters.slice(0, 2) || "HS";
  let code: string;
  do {
    code = prefix + String(100 + Math.floor(Math.random() * 900));
  } while (existing.some((s) => s.code === code));
  return code;
}
