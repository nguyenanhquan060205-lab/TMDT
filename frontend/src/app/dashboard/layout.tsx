"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LayoutDashboard, ShoppingBag, FolderTree, ClipboardList, ShieldAlert, ArrowLeft, Loader2, Home } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)

  useEffect(() => {
    const userStr = localStorage.getItem("user")
    const token = localStorage.getItem("token")

    if (!token || !userStr) {
      setIsAdmin(false)
      return
    }

    try {
      const user = JSON.parse(userStr)
      if (user.vaiTro === "admin") {
        setIsAdmin(true)
      } else {
        setIsAdmin(false)
      }
    } catch (e) {
      setIsAdmin(false)
    }
  }, [])

  if (isAdmin === null) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-zinc-950 text-white">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-zinc-400 font-medium">Đang xác thực quyền truy cập Admin...</p>
      </div>
    )
  }

  if (isAdmin === false) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center p-6 bg-zinc-950 text-white text-center gap-6">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blue-500/10 text-blue-500">
          <ShieldAlert className="h-12 w-12" />
        </div>
        <h1 className="text-3xl font-black tracking-tight">Khu vực quản trị Admin</h1>
        <p className="max-w-md text-zinc-400">
          Tài khoản của bạn không có quyền truy cập. Vui lòng quay lại trang chủ hoặc xem trang cá nhân.
        </p>
        <div className="flex gap-4">
          <Button size="lg" variant="outline" className="rounded-xl px-8" onClick={() => router.push("/")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Trang chủ
          </Button>
          <Button size="lg" className="rounded-xl px-8 bg-primary" onClick={() => router.push("/user/profile")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Trang cá nhân
          </Button>
        </div>
      </div>
    )
  }

  const menuItems = [
    { name: "Tổng quan", href: "/dashboard", icon: LayoutDashboard },
    { name: "Sản phẩm", href: "/dashboard/products", icon: ShoppingBag },
    { name: "Đơn hàng", href: "/dashboard/orders", icon: ClipboardList }
  ]

  return (
    <div className="flex min-h-screen bg-zinc-950 text-white">
      {/* Sidebar quản trị */}
      <aside className="w-64 border-r border-zinc-800 bg-zinc-900/50 backdrop-blur-xl flex flex-col fixed h-screen z-30">
        <div className="h-20 flex items-center px-8 border-b border-zinc-800">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-xl font-black tracking-tighter text-primary bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">
              ELEVEN ADMIN
            </span>
          </Link>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold tracking-tight transition-all duration-300 ${isActive
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-[1.02]"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
                  }`}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-zinc-800">
          <Button variant="ghost" className="w-full justify-start gap-3 text-zinc-400 hover:text-white hover:bg-zinc-800" asChild>
            <Link href="/">
              <Home className="h-5 w-5" />
              Xem trang chủ
            </Link>
          </Button>
        </div>
      </aside>

      {/* Nội dung trang quản trị */}
      <main className="flex-1 pl-64 min-h-screen">
        <div className="p-8 md:p-12 max-w-6xl mx-auto space-y-8">
          {children}
        </div>
      </main>
    </div>
  )
}
