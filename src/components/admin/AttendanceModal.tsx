"use client";

import { useState } from "react";
import { dayNameFor, fmtShort, type Slot } from "@/lib/slots";
import type { AttendanceRow } from "@/lib/types";

export type AttendanceModalCtx = {
  date: string;
  slotId: string;
  slot: Slot;
  students: { studentId: string; name: string; age: number | null }[];
};

export type AttendanceRowState = {
  studentId: string;
  name: string;
  age: number | null;
  present: boolean;
  comment: string;
  file: File | null;
  existing: AttendanceRow | null;
  removePhoto: boolean;
};

export type AttendanceSaveEntry = {
  studentId: string;
  present: boolean;
  comment: string;
  file: File | null;
  removePhoto: boolean;
  existing: AttendanceRow | null;
};

function buildInitialRows(
  ctx: AttendanceModalCtx | null,
  existingRecords: AttendanceRow[]
): AttendanceRowState[] {
  if (!ctx) return [];
  return ctx.students.map((s) => {
    const existing = existingRecords.find((a) => a.student_id === s.studentId) || null;
    return {
      studentId: s.studentId,
      name: s.name,
      age: s.age,
      present: true,
      comment: existing?.comment || "",
      file: null,
      existing,
      removePhoto: false,
    };
  });
}

export default function AttendanceModal({
  ctx,
  existingRecords,
  onClose,
  onSubmit,
}: {
  ctx: AttendanceModalCtx | null;
  existingRecords: AttendanceRow[];
  onClose: () => void;
  onSubmit: (entries: AttendanceSaveEntry[]) => void;
}) {
  const [rows, setRows] = useState<AttendanceRowState[]>(() => buildInitialRows(ctx, existingRecords));
  const [saving, setSaving] = useState(false);

  if (!ctx) return null;

  function updateRow(studentId: string, patch: Partial<AttendanceRowState>) {
    setRows((prev) => prev.map((r) => (r.studentId === studentId ? { ...r, ...patch } : r)));
  }

  function handleSave() {
    setSaving(true);
    onSubmit(
      rows.map((r) => ({
        studentId: r.studentId,
        present: r.present,
        comment: r.comment.trim(),
        file: r.file,
        removePhoto: r.removePhoto,
        existing: r.existing,
      }))
    );
  }

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <h2>Điểm danh &amp; kết quả buổi học</h2>
        <p className="sub">
          {dayNameFor(ctx.date)} {fmtShort(new Date(ctx.date + "T00:00:00"))} · {ctx.slot.start}–{ctx.slot.end}
        </p>
        <div className="attendance-rows">
          {rows.map((row) => (
            <div className="attendance-row" key={row.studentId}>
              <label className="row-head">
                <input
                  type="checkbox"
                  checked={row.present}
                  onChange={(e) => updateRow(row.studentId, { present: e.target.checked })}
                />
                {row.name}
                {row.age ? ` · ${row.age} tuổi` : ""}
              </label>
              <input
                type="text"
                maxLength={160}
                placeholder="Nhận xét của cô (không bắt buộc)"
                value={row.comment}
                onChange={(e) => updateRow(row.studentId, { comment: e.target.value })}
              />
              <input
                type="file"
                accept="image/*"
                onChange={(e) => updateRow(row.studentId, { file: e.target.files?.[0] || null })}
              />
              {row.existing?.photo_path && !row.removePhoto && (
                <div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={row.existing.photo_path} alt="Ảnh hiện tại" className="attendance-photo-preview" />
                  <button
                    className="cancel-slot-btn"
                    type="button"
                    onClick={() => updateRow(row.studentId, { removePhoto: true })}
                  >
                    Xoá ảnh hiện tại
                  </button>
                </div>
              )}
              {row.removePhoto && <p className="lookup-hint">Ảnh sẽ được xoá khi lưu.</p>}
            </div>
          ))}
        </div>
        <div className="modal-actions">
          <button className="btn ghost" onClick={onClose} disabled={saving}>
            Huỷ
          </button>
          <button className="btn primary" onClick={handleSave} disabled={saving}>
            {saving ? "Đang lưu…" : "Lưu"}
          </button>
        </div>
      </div>
    </div>
  );
}
