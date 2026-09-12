"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError("Email hoặc mật khẩu không đúng.");
      return;
    }
    router.replace("/admin");
    router.refresh();
  }

  return (
    <div className="auth-shell">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>Đăng nhập quản trị</h1>
        <p className="auth-note">Dành cho quản lý lớp vẽ. Phụ huynh vui lòng dùng mã số học sinh ở trang chủ.</p>
        {error && <div className="auth-error">{error}</div>}
        <div className="field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
          />
        </div>
        <div className="field">
          <label htmlFor="password">Mật khẩu</label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </div>
        <button className="btn primary" type="submit" disabled={loading}>
          {loading ? "Đang đăng nhập…" : "Đăng nhập"}
        </button>
        <p className="auth-note">
          Chưa có tài khoản quản trị? <Link href="/admin/setup">Tạo tài khoản lần đầu</Link>
        </p>
        <p className="auth-note">
          <Link href="/">← Về trang lịch học</Link>
        </p>
      </form>
    </div>
  );
}
