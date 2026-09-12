# The Art Forge — Lịch Học Vẽ Thiếu Nhi

Ứng dụng quản lý lịch học cho lớp vẽ (Next.js + Supabase), triển khai trên Vercel.

- **Trang công khai** (`/`): lịch học tuần, tra cứu lịch & kết quả học bằng mã số học sinh.
- **Trang quản trị** (`/admin`): đăng nhập bằng Supabase Auth (email/mật khẩu), thêm học sinh, thêm/huỷ buổi học, báo nghỉ, điểm danh & ghi kết quả (nhận xét + ảnh bức vẽ).

## Chạy local

```bash
npm install
npm run dev
```

Tạo file `.env.local` (xem `.env.example`) với thông tin project Supabase:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

## Tạo tài khoản quản trị lần đầu

Vào `/admin/setup` để tạo mật khẩu cho tài khoản quản trị (`ADMIN_EMAIL` trong `src/lib/types.ts`). Sau khi tạo xong, vào Supabase Dashboard → Authentication → Sign In / Providers và tắt đăng ký công khai (Allow new users to sign up) để không ai khác tự tạo tài khoản.

## Bảo mật

Toàn bộ quyền admin được thực thi bằng Postgres Row Level Security (hàm `is_admin()` kiểm tra email trong JWT), không phải chỉ ở giao diện — nên kể cả khi bỏ qua giao diện, chỉ đúng tài khoản admin mới ghi được dữ liệu. Public chỉ đọc dữ liệu qua các RPC `get_calendar_data` và `lookup_student` (không truy cập trực tiếp bảng `students`/`attendance`), giữ mã số học sinh và số điện thoại phụ huynh không bị lộ hàng loạt.
