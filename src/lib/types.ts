export type CalendarBooking = {
  booking_id: string;
  date: string;
  slot_id: string;
  student_name: string;
  student_age: number | null;
  sample: boolean;
};

export type NoteRow = {
  id: string;
  date: string;
  slot_id: string | null;
  type: "closed" | "info";
  text: string;
};

export type Student = {
  id: string;
  code: string;
  name: string;
  age: number | null;
  phone: string | null;
  sample: boolean;
};

export type AttendanceRow = {
  id: string;
  student_id: string;
  date: string;
  slot_id: string;
  comment: string | null;
  photo_path: string | null;
  sample: boolean;
  created_at: string;
};

export type BookingRow = {
  id: string;
  date: string;
  slot_id: string;
  student_id: string;
  note: string | null;
  sample: boolean;
};

export type AdminBooking = {
  id: string;
  date: string;
  slot_id: string;
  note: string | null;
  sample: boolean;
  students: Student;
};

export type LookupResult = {
  name: string;
  age: number | null;
  sample: boolean;
  upcoming: { date: string; slot_id: string }[];
  history: {
    date: string;
    slot_id: string;
    comment: string | null;
    photo_path: string | null;
    sample: boolean;
  }[];
};

export const ADMIN_EMAIL = "voledinhphu@gmail.com";
