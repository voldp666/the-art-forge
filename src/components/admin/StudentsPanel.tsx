"use client";

import { useState } from "react";
import type { Student } from "@/lib/types";

export default function StudentsPanel({
  students,
  onDelete,
}: {
  students: Student[];
  onDelete: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const sorted = [...students].sort((a, b) => a.name.localeCompare(b.name, "vi"));

  return (
    <section className="panel">
      <button className="panel-toggle" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
        👨‍👩‍👧 Quản lý học sinh &amp; mã số
      </button>
      {open && (
        <div className="panel-body">
          <p className="lookup-hint">
            Mã số dùng để phụ huynh tra cứu lịch &amp; kết quả học của bé. Học sinh mới được tạo tự động khi bạn
            thêm bé vào một buổi học.
          </p>
          {sorted.length === 0 ? (
            <p className="lookup-hint">Chưa có học sinh nào. Thêm bé vào một buổi học để tạo hồ sơ học sinh.</p>
          ) : (
            sorted.map((s) => (
              <div className="student-row" key={s.id}>
                <span className="name">
                  {s.name}
                  {s.age ? ` · ${s.age} tuổi` : ""}
                </span>
                <span className="code-tag">{s.code}</span>
                {s.phone && <span>📞 {s.phone}</span>}
                {s.sample && <span className="sample-tag">mẫu</span>}
                <button
                  className="cancel-slot-btn"
                  onClick={() => {
                    if (window.confirm(`Xoá học sinh "${s.name}"? Các buổi đăng ký và kết quả của bé cũng sẽ bị xoá.`)) {
                      onDelete(s.id);
                    }
                  }}
                >
                  Xoá
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </section>
  );
}
