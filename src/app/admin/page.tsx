"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Calendar from "@/components/Calendar";
import StudentsPanel from "@/components/admin/StudentsPanel";
import StudentModal, { type StudentModalCtx, type StudentSubmitPayload } from "@/components/admin/StudentModal";
import NoteModal, { type NoteModalCtx } from "@/components/admin/NoteModal";
import AttendanceModal, {
  type AttendanceModalCtx,
  type AttendanceSaveEntry,
} from "@/components/admin/AttendanceModal";
import Toast, { useToast } from "@/components/Toast";
import { generateStudentCode } from "@/lib/studentCode";
import { resizeImageFile } from "@/lib/image";
import { addDays, findSlotMeta, startOfWeek, toISO } from "@/lib/slots";
import type { AdminBooking, AttendanceRow, CalendarBooking, NoteRow, Student } from "@/lib/types";

export default function AdminDashboard() {
  const router = useRouter();
  const { message, showToast } = useToast();

  const [weekOffset, setWeekOffset] = useState(0);
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [notes, setNotes] = useState<NoteRow[]>([]);
  const [students, setStudents] = useState<Student[]>([]);

  const [studentModalCtx, setStudentModalCtx] = useState<StudentModalCtx | null>(null);
  const [noteModalCtx, setNoteModalCtx] = useState<NoteModalCtx | null>(null);
  const [attendanceModalCtx, setAttendanceModalCtx] = useState<AttendanceModalCtx | null>(null);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRow[]>([]);

  const weekRange = useMemo(() => {
    const base = addDays(startOfWeek(new Date()), weekOffset * 7);
    return { start: toISO(base), end: toISO(addDays(base, 6)) };
  }, [weekOffset]);

  const fetchWeekData = useCallback(async () => {
    const supabase = createClient();
    const [{ data: bookingsData }, { data: notesData }] = await Promise.all([
      supabase
        .from("bookings")
        .select("id,date,slot_id,note,sample,students(id,code,name,age,phone,sample)")
        .gte("date", weekRange.start)
        .lte("date", weekRange.end),
      supabase.from("notes").select("*").gte("date", weekRange.start).lte("date", weekRange.end),
    ]);
    setBookings((bookingsData as unknown as AdminBooking[]) || []);
    setNotes((notesData as NoteRow[]) || []);
  }, [weekRange]);

  const fetchStudents = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase.from("students").select("*").order("name");
    setStudents((data as Student[]) || []);
  }, []);

  useEffect(() => {
    // fetchWeekData sets state only after its internal awaits resolve, not synchronously
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchWeekData();
  }, [fetchWeekData]);

  useEffect(() => {
    // fetchStudents sets state only after its internal awaits resolve, not synchronously
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchStudents();
  }, [fetchStudents]);

  const calendarBookings: CalendarBooking[] = bookings.map((b) => ({
    booking_id: b.id,
    date: b.date,
    slot_id: b.slot_id,
    student_name: b.students?.name || "(học sinh đã xoá)",
    student_age: b.students?.age ?? null,
    sample: b.sample,
  }));

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/admin/login");
    router.refresh();
  }

  async function handleRemoveBooking(bookingId: string) {
    const supabase = createClient();
    const { error } = await supabase.from("bookings").delete().eq("id", bookingId);
    if (error) {
      showToast("Không thể xoá, vui lòng thử lại.");
      return;
    }
    fetchWeekData();
  }

  async function handleRemoveNote(noteId: string) {
    const supabase = createClient();
    const { error } = await supabase.from("notes").delete().eq("id", noteId);
    if (error) {
      showToast("Không thể xoá ghi chú.");
      return;
    }
    fetchWeekData();
  }

  async function handleNoteSubmit(text: string) {
    if (!noteModalCtx) return;
    const supabase = createClient();
    const { error } = await supabase.from("notes").insert({
      date: noteModalCtx.date,
      slot_id: noteModalCtx.slotId,
      type: noteModalCtx.type,
      text,
    });
    setNoteModalCtx(null);
    if (error) {
      showToast("Không thể lưu ghi chú.");
      return;
    }
    fetchWeekData();
  }

  async function handleStudentSubmit(payload: StudentSubmitPayload) {
    if (!studentModalCtx) return;
    const supabase = createClient();
    let studentId: string;

    if (payload.kind === "existing") {
      studentId = payload.studentId;
    } else {
      const code = generateStudentCode(payload.name, students);
      const { data, error } = await supabase
        .from("students")
        .insert({ code, name: payload.name, age: payload.age, phone: payload.phone })
        .select()
        .single();
      if (error || !data) {
        showToast("Không thể tạo học sinh mới.");
        return;
      }
      studentId = data.id;
      window.alert(
        `Đã tạo học sinh mới: ${payload.name}\nMã số tra cứu: ${code}\n\nHãy gửi mã này cho phụ huynh để xem lịch & kết quả học của bé.`
      );
    }

    const { error: bookingError } = await supabase.from("bookings").insert({
      date: studentModalCtx.date,
      slot_id: studentModalCtx.slotId,
      student_id: studentId,
      note: payload.note,
    });
    setStudentModalCtx(null);
    if (bookingError) {
      showToast("Không thể thêm bé vào buổi học.");
      return;
    }
    fetchWeekData();
    fetchStudents();
  }

  async function handleDeleteStudent(id: string) {
    const supabase = createClient();
    const { error } = await supabase.from("students").delete().eq("id", id);
    if (error) {
      showToast("Không thể xoá học sinh.");
      return;
    }
    fetchWeekData();
    fetchStudents();
  }

  async function openAttendanceModal(dateISO: string, slotId: string) {
    const slot = findSlotMeta(dateISO, slotId);
    if (!slot) return;
    const slotBookings = bookings.filter((b) => b.date === dateISO && b.slot_id === slotId);
    if (slotBookings.length === 0) {
      showToast("Chưa có bé đăng ký buổi này để điểm danh.");
      return;
    }
    const supabase = createClient();
    const { data } = await supabase
      .from("attendance")
      .select("*")
      .eq("date", dateISO)
      .eq("slot_id", slotId);
    setAttendanceRecords((data as AttendanceRow[]) || []);
    setAttendanceModalCtx({
      date: dateISO,
      slotId,
      slot,
      students: slotBookings.map((b) => ({
        studentId: b.students.id,
        name: b.students.name,
        age: b.students.age,
      })),
    });
  }

  async function handleAttendanceSubmit(entries: AttendanceSaveEntry[]) {
    if (!attendanceModalCtx) return;
    const supabase = createClient();
    const { date, slotId } = attendanceModalCtx;

    for (const entry of entries) {
      if (!entry.present) {
        if (entry.existing) {
          await supabase.from("attendance").delete().eq("id", entry.existing.id);
        }
        continue;
      }

      let photoPath: string | null = entry.existing?.photo_path ?? null;
      if (entry.removePhoto) photoPath = null;

      if (entry.file) {
        try {
          const blob = await resizeImageFile(entry.file, 480);
          const path = `${entry.studentId}/${date}_${slotId}_${Date.now()}.jpg`;
          const { error: uploadError } = await supabase.storage
            .from("artwork")
            .upload(path, blob, { contentType: "image/jpeg", upsert: true });
          if (!uploadError) {
            const { data: pub } = supabase.storage.from("artwork").getPublicUrl(path);
            photoPath = pub.publicUrl;
          }
        } catch {
          showToast("Không thể xử lý một ảnh, đã bỏ qua ảnh đó.");
        }
      }

      if (entry.existing) {
        await supabase
          .from("attendance")
          .update({ comment: entry.comment, photo_path: photoPath })
          .eq("id", entry.existing.id);
      } else {
        await supabase.from("attendance").insert({
          student_id: entry.studentId,
          date,
          slot_id: slotId,
          comment: entry.comment,
          photo_path: photoPath,
        });
      }
    }

    setAttendanceModalCtx(null);
    showToast("Đã lưu điểm danh & kết quả.");
  }

  return (
    <div className="page">
      <header className="admin-topbar">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">
            ✎
          </span>
          <div>
            <h1>Quản trị lớp vẽ</h1>
            <p className="tagline">The Art Forge</p>
          </div>
        </div>
        <div className="header-actions">
          <Link className="pill-link" href="/">
            Xem trang công khai
          </Link>
          <button className="pill-link" onClick={handleLogout}>
            Đăng xuất
          </button>
        </div>
      </header>

      <Calendar
        weekOffset={weekOffset}
        onWeekOffsetChange={setWeekOffset}
        bookings={calendarBookings}
        notes={notes}
        editable
        onAddStudent={(date, slotId) => {
          const slot = findSlotMeta(date, slotId);
          if (slot) setStudentModalCtx({ date, slotId, slot });
        }}
        onRemoveBooking={handleRemoveBooking}
        onCancelSlot={(date, slotId) => {
          const slot = findSlotMeta(date, slotId);
          setNoteModalCtx({ date, type: "closed", slotId, slot });
        }}
        onReopenSlot={handleRemoveNote}
        onOpenAttendance={openAttendanceModal}
        onCloseDay={(date) => setNoteModalCtx({ date, type: "closed", slotId: null, slot: null })}
        onReopenDay={handleRemoveNote}
        onAddInfoNote={(date) => setNoteModalCtx({ date, type: "info", slotId: null, slot: null })}
        onRemoveNote={handleRemoveNote}
      />

      <StudentsPanel students={students} onDelete={handleDeleteStudent} />

      <StudentModal
        key={studentModalCtx ? `${studentModalCtx.date}-${studentModalCtx.slotId}` : "closed"}
        ctx={studentModalCtx}
        students={students}
        onClose={() => setStudentModalCtx(null)}
        onSubmit={handleStudentSubmit}
      />
      <NoteModal
        key={noteModalCtx ? `${noteModalCtx.date}-${noteModalCtx.slotId}-${noteModalCtx.type}` : "closed"}
        ctx={noteModalCtx}
        onClose={() => setNoteModalCtx(null)}
        onSubmit={handleNoteSubmit}
      />
      <AttendanceModal
        key={attendanceModalCtx ? `${attendanceModalCtx.date}-${attendanceModalCtx.slotId}` : "closed"}
        ctx={attendanceModalCtx}
        existingRecords={attendanceRecords}
        onClose={() => setAttendanceModalCtx(null)}
        onSubmit={handleAttendanceSubmit}
      />

      <Toast message={message} />
    </div>
  );
}
