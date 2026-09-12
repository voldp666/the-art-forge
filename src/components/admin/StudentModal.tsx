"use client";

import { useState } from "react";
import { dayNameFor, fmtShort, type Slot } from "@/lib/slots";
import type { Student } from "@/lib/types";

export type StudentModalCtx = { date: string; slotId: string; slot: Slot };

export type StudentSubmitPayload =
  | { kind: "existing"; studentId: string; note: string }
  | { kind: "new"; name: string; age: number | null; phone: string; note: string };

export default function StudentModal({
  ctx,
  students,
  onClose,
  onSubmit,
}: {
  ctx: StudentModalCtx | null;
  students: Student[];
  onClose: () => void;
  onSubmit: (payload: StudentSubmitPayload) => void;
}) {
  const [pickId, setPickId] = useState("");
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");

  if (!ctx) return null;

  const sorted = [...students].sort((a, b) => a.name.localeCompare(b.name, "vi"));

  function handleSave() {
    if (pickId) {
      onSubmit({ kind: "existing", studentId: pickId, note: note.trim() });
      return;
    }
    if (!name.trim()) return;
    onSubmit({
      kind: "new",
      name: name.trim(),
      age: age ? parseInt(age, 10) : null,
      phone: phone.trim(),
      note: note.trim(),
    });
  }

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <h2>Thêm bé vào lớp</h2>
        <p className="sub">
          {dayNameFor(ctx.date)} {fmtShort(new Date(ctx.date + "T00:00:00"))} · {ctx.slot.start}–{ctx.slot.end}
        </p>
        <div className="field">
          <label htmlFor="studentPick">Học sinh</label>
          <select id="studentPick" value={pickId} onChange={(e) => setPickId(e.target.value)}>
            <option value="">+ Học sinh mới</option>
            {sorted.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.code})
              </option>
            ))}
          </select>
        </div>
        {!pickId && (
          <>
            <div className="field">
              <label htmlFor="studentName">Tên bé</label>
              <input
                id="studentName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="VD: Bé An"
                maxLength={60}
              />
            </div>
            <div className="field-row">
              <div className="field">
                <label htmlFor="studentAge">Tuổi</label>
                <input
                  id="studentAge"
                  type="number"
                  min={4}
                  max={15}
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="VD: 7"
                />
              </div>
              <div className="field">
                <label htmlFor="studentPhone">SĐT phụ huynh</label>
                <input
                  id="studentPhone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Không bắt buộc"
                  maxLength={20}
                />
              </div>
            </div>
          </>
        )}
        <div className="field">
          <label htmlFor="studentNote">Ghi chú</label>
          <input
            id="studentNote"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Không bắt buộc"
            maxLength={80}
          />
        </div>
        <div className="modal-actions">
          <button className="btn ghost" onClick={onClose}>
            Huỷ
          </button>
          <button className="btn primary" onClick={handleSave}>
            Lưu
          </button>
        </div>
      </div>
    </div>
  );
}
