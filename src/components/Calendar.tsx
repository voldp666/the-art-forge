"use client";

import { useMemo } from "react";
import {
  DAY_NAMES,
  addDays,
  findSlotMeta,
  fmtShort,
  sameDate,
  slotsForDow,
  startOfWeek,
  toISO,
} from "@/lib/slots";
import type { CalendarBooking, NoteRow } from "@/lib/types";

export type CalendarProps = {
  weekOffset: number;
  onWeekOffsetChange: (next: number) => void;
  bookings: CalendarBooking[];
  notes: NoteRow[];
  editable: boolean;
  onAddStudent?: (dateISO: string, slotId: string) => void;
  onRemoveBooking?: (bookingId: string) => void;
  onCancelSlot?: (dateISO: string, slotId: string) => void;
  onReopenSlot?: (noteId: string) => void;
  onOpenAttendance?: (dateISO: string, slotId: string) => void;
  onCloseDay?: (dateISO: string) => void;
  onReopenDay?: (noteId: string) => void;
  onAddInfoNote?: (dateISO: string) => void;
  onRemoveNote?: (noteId: string) => void;
};

export default function Calendar({
  weekOffset,
  onWeekOffsetChange,
  bookings,
  notes,
  editable,
  onAddStudent,
  onRemoveBooking,
  onCancelSlot,
  onReopenSlot,
  onOpenAttendance,
  onCloseDay,
  onReopenDay,
  onAddInfoNote,
  onRemoveNote,
}: CalendarProps) {
  const today = useMemo(() => new Date(), []);
  const days = useMemo(() => {
    const base = addDays(startOfWeek(today), weekOffset * 7);
    return Array.from({ length: 7 }, (_, i) => addDays(base, i));
  }, [today, weekOffset]);

  const weekLabel = `Tuần ${fmtShort(days[0])} – ${fmtShort(days[6])}/${days[6].getFullYear()}`;

  const notesFor = (iso: string) => notes.filter((n) => n.date === iso);
  const bookingsFor = (iso: string, slotId: string) =>
    bookings.filter((b) => b.date === iso && b.slot_id === slotId);

  const weekNotes = days.flatMap((d) => notesFor(toISO(d)));

  return (
    <>
      <nav className="week-nav">
        <button className="nav-btn" aria-label="Tuần trước" onClick={() => onWeekOffsetChange(weekOffset - 1)}>
          ‹
        </button>
        <div className="week-label">{weekLabel}</div>
        <button className="nav-btn today-btn" onClick={() => onWeekOffsetChange(0)}>
          Hôm nay
        </button>
        <button className="nav-btn" aria-label="Tuần sau" onClick={() => onWeekOffsetChange(weekOffset + 1)}>
          ›
        </button>
      </nav>

      {weekNotes.length > 0 && (
        <div className="note-banner">
          {weekNotes.map((n) => {
            const sm = n.slot_id ? findSlotMeta(n.date, n.slot_id) : null;
            const icon = n.type === "closed" ? "🚫 " : "📌 ";
            const suffix = sm ? ` (${sm.label} ${sm.start}–${sm.end})` : "";
            return (
              <div className="note-row" key={n.id}>
                <span>
                  {icon}
                  {n.text}
                  {suffix} — {fmtShort(new Date(n.date + "T00:00:00"))}
                </span>
                {editable && onRemoveNote && (
                  <button className="remove-note" title="Xoá ghi chú" onClick={() => onRemoveNote(n.id)}>
                    ×
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      <main className="calendar-wrap">
        <div className="calendar-scroll">
          <div className="calendar-grid">
            {days.map((d, idx) => {
              const dow = d.getDay();
              const iso = toISO(d);
              const dayNotes = notesFor(iso);
              const wholeDayClosedNote = dayNotes.find((n) => n.type === "closed" && !n.slot_id) || null;
              const slots = slotsForDow(dow);

              return (
                <div className={`day-col${sameDate(d, today) ? " is-today" : ""}`} key={iso}>
                  <div className="day-head">
                    <div className="day-name">{DAY_NAMES[idx]}</div>
                    <div className="day-date">{fmtShort(d)}</div>
                  </div>

                  {dow === 1 || wholeDayClosedNote ? (
                    <div className="day-closed">
                      {dow === 1
                        ? "Lớp nghỉ Thứ Hai"
                        : `🚫 Lớp nghỉ hôm nay${wholeDayClosedNote?.text ? ": " + wholeDayClosedNote.text : ""}`}
                    </div>
                  ) : (
                    slots.map((slot) => {
                      const slotClosedNote =
                        dayNotes.find((n) => n.type === "closed" && n.slot_id === slot.id) || null;
                      const slotBookings = bookingsFor(iso, slot.id);
                      return (
                        <div className={`slot-card${slotClosedNote ? " is-closed" : ""}`} key={slot.id}>
                          <div className="slot-time">
                            <span>
                              {slot.start}–{slot.end}
                            </span>
                            <span className="slot-label">{slot.label}</span>
                          </div>

                          {slotClosedNote ? (
                            <div className="slot-closed-banner">
                              <span>🚫 Buổi này đã nghỉ</span>
                              {slotClosedNote.text && <span className="reason">{slotClosedNote.text}</span>}
                            </div>
                          ) : (
                            <div className="slot-hint">{slot.hint}</div>
                          )}

                          <div className="student-list">
                            {slotBookings.map((b) => (
                              <div className={`student-chip${b.sample ? " is-sample" : ""}`} key={b.booking_id}>
                                <span className="name">{b.student_name}</span>
                                {b.student_age ? <span className="age-tag">{b.student_age} tuổi</span> : null}
                                {b.sample && <span className="sample-tag">mẫu</span>}
                                {editable && onRemoveBooking && (
                                  <button title="Xoá" onClick={() => onRemoveBooking(b.booking_id)}>
                                    ×
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>

                          {editable &&
                            (slotClosedNote ? (
                              onReopenSlot && (
                                <button
                                  className="reopen-slot-btn"
                                  onClick={() => onReopenSlot(slotClosedNote.id)}
                                >
                                  Mở lại buổi học
                                </button>
                              )
                            ) : (
                              <>
                                {onAddStudent && (
                                  <button className="add-student-btn" onClick={() => onAddStudent(iso, slot.id)}>
                                    + Thêm bé
                                  </button>
                                )}
                                {onOpenAttendance && (
                                  <button
                                    className="cancel-slot-btn attendance-link"
                                    onClick={() => onOpenAttendance(iso, slot.id)}
                                  >
                                    📷 Điểm danh / kết quả
                                  </button>
                                )}
                                {onCancelSlot && (
                                  <button className="cancel-slot-btn" onClick={() => onCancelSlot(iso, slot.id)}>
                                    Huỷ buổi này
                                  </button>
                                )}
                              </>
                            ))}
                        </div>
                      );
                    })
                  )}

                  {editable && (
                    <div className="day-actions">
                      {wholeDayClosedNote ? (
                        onReopenDay && (
                          <button className="add-note-btn" onClick={() => onReopenDay(wholeDayClosedNote.id)}>
                            ✅ Mở lớp lại (bỏ nghỉ)
                          </button>
                        )
                      ) : dow !== 1 ? (
                        <>
                          {onCloseDay && (
                            <button className="add-note-btn is-warn" onClick={() => onCloseDay(iso)}>
                              🚫 Báo nghỉ cả ngày
                            </button>
                          )}
                          {onAddInfoNote && (
                            <button className="add-note-btn" onClick={() => onAddInfoNote(iso)}>
                              📌 Thêm thông báo
                            </button>
                          )}
                        </>
                      ) : null}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </>
  );
}
