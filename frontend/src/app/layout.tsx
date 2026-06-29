import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Providers } from "@/components/providers";


// Cấu hình font Geist Sans từ Google Fonts
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "latin-ext"],
});

// Cấu hình font Geist Mono từ Google Fonts
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin", "latin-ext"],
});

// Metadata cho trang (SEO)
export const metadata: Metadata = {
  title: "ELEVEN | E-commerce Platform",
  description: "Amazing shopping experience with ELEVEN",
};

// Layout gốc - bao bọc toàn bộ ứng dụng
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>
          {/* Thanh điều hướng trên cùng */}
          <Navbar />
          {/* Nội dung chính - flex-1 để chiếm hết không gian còn lại */}
          <main className="flex-1">{children}</main>
          {/* Chân trang dưới cùng */}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
