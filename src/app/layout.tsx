import type { Metadata } from "next";
import { Baloo_2, Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";

const baloo = Baloo_2({
  variable: "--font-baloo",
  subsets: ["vietnamese", "latin"],
  weight: ["500", "600", "700"],
});

const beVietnam = Be_Vietnam_Pro({
  variable: "--font-be-vietnam",
  subsets: ["vietnamese", "latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Lịch Học Vẽ Thiếu Nhi | The Art Forge",
  description:
    "Lịch học tuần cho lớp vẽ thiếu nhi 4–15 tuổi tại 452 Bạch Đằng, Quy Nhơn — xem lịch, tra cứu kết quả học của bé bằng mã số.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={`${baloo.variable} ${beVietnam.variable}`}>{children}</body>
    </html>
  );
}
