"use client";

import { useState } from "react";
import { dayNameFor, fmtShort, type Slot } from "@/lib/slots";

export type NoteModalCtx = {
  date: string;
  type: "closed" | "info";
  slotId: string | null;
  slot: Slot | null;
};

export default function NoteModal({
  ctx,
  onClose,
  onSubmit,
}: {
  ctx: NoteModalCtx | null;
  onClose: () => void;
  onSubmit: (text: string) => void;
}) {
  const [text, setText] = useState("");

  if (!ctx) return null;

  const title = ctx.type === "closed" ? (ctx.slotId ? "Huỷ buổi học" : "Báo nghỉ cả ngày") : "Thêm thông báo";
  const label = ctx.type === "closed" ? "Lý do (không bắt buộc)" : "Nội dung";
  const placeholder = ctx.type === "closed" ? "VD: Nghỉ lễ Quốc khánh" : "VD: Đổi giờ tuần này";
  const dayLabel = `${dayNameFor(ctx.date)} ${fmtShort(new Date(ctx.date + "T00:00:00"))}`;
  const sub = ctx.slot ? `${dayLabel} · ${ctx.slot.start}–${ctx.slot.end}` : dayLabel;

  function handleSave() {
    if (!ctx) return;
    let value = text.trim();
    if (!value) {
      if (ctx.type === "closed") {
        value = ctx.slotId ? "Nghỉ buổi học" : "Lớp nghỉ hôm nay";
      } else {
        return;
      }
    }
    onSubmit(value);
  }

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <h2>{title}</h2>
        <p className="sub">{sub}</p>
        <div className="field">
          <label htmlFor="noteText">{label}</label>
          <input
            id="noteText"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={placeholder}
            maxLength={120}
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
