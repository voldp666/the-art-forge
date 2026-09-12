"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import Calendar from "@/components/Calendar";
import LookupPanel from "@/components/LookupPanel";
import { addDays, startOfWeek, toISO } from "@/lib/slots";
import type { CalendarBooking, NoteRow } from "@/lib/types";

export default function HomePage() {
  const [weekOffset, setWeekOffset] = useState(0);
  const [bookings, setBookings] = useState<CalendarBooking[]>([]);
  const [notes, setNotes] = useState<NoteRow[]>([]);
  const [materialsOpen, setMaterialsOpen] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    const base = addDays(startOfWeek(new Date()), weekOffset * 7);
    const start = toISO(base);
    const end = toISO(addDays(base, 6));

    supabase
      .rpc("get_calendar_data", { p_start: start, p_end: end })
      .then(({ data }) => setBookings((data as CalendarBooking[]) || []));

    supabase
      .from("notes")
      .select("*")
      .gte("date", start)
      .lte("date", end)
      .then(({ data }) => setNotes((data as NoteRow[]) || []));
  }, [weekOffset]);

  return (
    <div className="page">
      <header className="site-header">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">
            ✎
          </span>
          <div>
            <h1>Lớp Vẽ Cho Bé</h1>
            <p className="tagline">Lịch học tuần · dành cho bé 4–15 tuổi</p>
          </div>
        </div>
        <div className="header-actions">
          <Link className="pill-link" href="/admin">
            Quản trị
          </Link>
        </div>
      </header>

      <section className="info-strip">
        <div className="info-item">
          <strong>Địa điểm</strong>
          <span>452 Bạch Đằng, phường Quy Nhơn, tỉnh Gia Lai</span>
        </div>
        <div className="info-item">
          <strong>Thời lượng buổi học</strong>
          <span>2 tiếng (5 tuổi trở lên) · 1 tiếng 30 (4 tuổi)</span>
        </div>
        <div className="info-item pickup">
          <strong>💓 Lưu ý</strong>
          <span>Phụ huynh vui lòng đưa đón bé đúng giờ giúp cô ạ</span>
        </div>
      </section>

      <LookupPanel />

      <Calendar
        weekOffset={weekOffset}
        onWeekOffsetChange={setWeekOffset}
        bookings={bookings}
        notes={notes}
        editable={false}
      />

      <section className="panel">
        <button
          className="panel-toggle"
          aria-expanded={materialsOpen}
          onClick={() => setMaterialsOpen((v) => !v)}
        >
          🎨 Hoạ cụ được chuẩn bị sẵn
        </button>
        {materialsOpen && (
          <div className="panel-body">
            <p>
              Giấy màu nước dày khổ A3, màu nước, màu lụa, crayon, bút màu marker, acrylic marker, canvas,
              acrylic.
            </p>
          </div>
        )}
      </section>

      <footer className="site-footer">
        <p>452 Bạch Đằng, phường Quy Nhơn, tỉnh Gia Lai</p>
      </footer>
    </div>
  );
}
