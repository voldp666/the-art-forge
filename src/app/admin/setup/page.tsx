"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { ADMIN_EMAIL } from "@/lib/types";

export default function AdminSetupPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<"confirm-email" | "ready" | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("Mật khẩu cần ít nhất 8 ký tự.");
      return;
    }
    if (password !== confirm) {
      setError("Mật khẩu nhập lại không khớp.");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({ email: ADMIN_EMAIL, password });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setDone(data.session ? "ready" : "confirm-email");
  }

  if (done) {
    return (
      <div className="auth-shell">
        <div className="auth-card">
          <h1>Đã tạo tài khoản</h1>
          {done === "confirm-email" ? (
            <p className="auth-note">
              Supabase đã gửi email xác nhận tới <strong>{ADMIN_EMAIL}</strong>. Vui lòng bấm vào liên kết trong
              email đó, sau đó quay lại trang đăng nhập.
            </p>
          ) : (
            <p className="auth-note">Tài khoản đã sẵn sàng, bạn có thể đăng nhập ngay.</p>
          )}
          <p className="auth-note">
            <Link href="/admin/login">Đến trang đăng nhập →</Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-shell">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>Tạo tài khoản quản trị</h1>
        <p className="auth-note">
          Chỉ dùng một lần để tạo tài khoản đăng nhập cho <strong>{ADMIN_EMAIL}</strong>. Sau khi tạo xong, hãy nhờ
          tắt đăng ký công khai trong Supabase Dashboard (Authentication → Sign In / Providers).
        </p>
        {error && <div className="auth-error">{error}</div>}
        <div className="field">
          <label>Email</label>
          <input type="email" value={ADMIN_EMAIL} readOnly />
        </div>
        <div className="field">
          <label htmlFor="password">Mật khẩu (tối thiểu 8 ký tự)</label>
          <input
            id="password"
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
          />
        </div>
        <div className="field">
          <label htmlFor="confirm">Nhập lại mật khẩu</label>
          <input
            id="confirm"
            type="password"
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
          />
        </div>
        <button className="btn primary" type="submit" disabled={loading}>
          {loading ? "Đang tạo…" : "Tạo tài khoản"}
        </button>
        <p className="auth-note">
          <Link href="/admin/login">← Đã có tài khoản? Đăng nhập</Link>
        </p>
      </form>
    </div>
  );
}
