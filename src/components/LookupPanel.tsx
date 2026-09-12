"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { findSlotMeta, fmtShort, toISO } from "@/lib/slots";
import type { LookupResult } from "@/lib/types";

export default function LookupPanel() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<LookupResult | null | undefined>(undefined);

  async function handleLookup() {
    const trimmed = code.trim();
    if (!trimmed) return;
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase.rpc("lookup_student", { p_code: trimmed });
    setLoading(false);
    if (error) {
      setResult(null);
      return;
    }
    setResult(data as LookupResult | null);
  }

  const todayISO = toISO(new Date());

  return (
    <section className="lookup-panel">
      <h2>👀 Xem lịch &amp; kết quả học của bé</h2>
      <p className="lookup-hint">
        Nhập mã số học sinh (cô đã gửi cho phụ huynh) để xem các buổi bé đã học và nhận xét của cô.
      </p>
      <div className="lookup-row">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleLookup()}
          type="text"
          placeholder="VD: AN482"
          maxLength={20}
        />
        <button className="btn primary" onClick={handleLookup} disabled={loading}>
          {loading ? "Đang tìm…" : "Xem"}
        </button>
      </div>

      {result !== undefined && (
        <div className="lookup-result">
          {result === null ? (
            <p className="lookup-hint">Không tìm thấy mã số này. Vui lòng kiểm tra lại hoặc liên hệ cô giáo.</p>
          ) : (
            <>
              <h3>
                {result.name}
                {result.age ? ` · ${result.age} tuổi` : ""}
                {result.sample ? " (mẫu)" : ""}
              </h3>

              {result.upcoming.length > 0 && (
                <>
                  <p>
                    <strong>Lịch sắp tới</strong>
                  </p>
                  <div className="lookup-list">
                    {result.upcoming
                      .filter((b) => b.date >= todayISO)
                      .map((b, i) => {
                        const sm = findSlotMeta(b.date, b.slot_id);
                        return (
                          <div className="lookup-entry" key={i}>
                            {fmtShort(new Date(b.date + "T00:00:00"))} ·{" "}
                            {sm ? `${sm.label} ${sm.start}–${sm.end}` : b.slot_id}
                          </div>
                        );
                      })}
                  </div>
                </>
              )}

              <p>
                <strong>Đã học &amp; kết quả</strong>
              </p>
              {result.history.length === 0 ? (
                <p className="lookup-hint">Chưa có buổi học nào được ghi nhận.</p>
              ) : (
                result.history.map((a, i) => {
                  const sm = findSlotMeta(a.date, a.slot_id);
                  return (
                    <div className="lookup-entry" key={i}>
                      <div className="entry-date">
                        {fmtShort(new Date(a.date + "T00:00:00"))} ·{" "}
                        {sm ? `${sm.label} ${sm.start}–${sm.end}` : a.slot_id}
                        {a.sample ? " (mẫu)" : ""}
                      </div>
                      {a.comment && <div className="entry-comment">{a.comment}</div>}
                      {a.photo_path && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={a.photo_path} alt="Ảnh bức vẽ" className="attendance-photo-preview" />
                      )}
                    </div>
                  );
                })
              )}
            </>
          )}
        </div>
      )}
    </section>
  );
}
