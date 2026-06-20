"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { User, ShoppingBag, LogOut, Home, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function UserLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const router = useRouter()
    const pathname = usePathname()
    const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null)
    const [user, setUser] = useState<any>(null)

    useEffect(() => {
        const userStr = localStorage.getItem("user")
        const token = localStorage.getItem("token")

        if (!token || !userStr) {
            setIsLoggedIn(false)
            return
        }

        try {
            const userData = JSON.parse(userStr)
            setUser(userData)
            setIsLoggedIn(true)
        } catch (e) {
            setIsLoggedIn(false)
        }
    }, [])

    const handleLogout = () => {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        setIsLoggedIn(false)
        router.push("/auth/login")
    }

    if (isLoggedIn === null) {
        return (
            <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-zinc-950 text-white">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-zinc-400 font-medium">Đang xác thực...</p>
            </div>
        )
    }

    if (isLoggedIn === false) {
        return (
            <div className="flex min-h-screen w-full flex-col items-center justify-center p-6 bg-zinc-950 text-white text-center gap-6">
                <div className="text-6xl">🔐</div>
                <h1 className="text-3xl font-black tracking-tight">Vui lòng đăng nhập</h1>
                <p className="max-w-md text-zinc-400">
                    Bạn cần đăng nhập để truy cập trang này.
                </p>
                <div className="flex gap-4">
                    <Button size="lg" variant="outline" className="rounded-xl px-8" onClick={() => router.push("/")}>
                        <Home className="mr-2 h-4 w-4" /> Trang chủ
                    </Button>
                    <Button size="lg" className="rounded-xl px-8 bg-primary" onClick={() => router.push("/auth/login")}>
                        Đăng nhập
                    </Button>
                </div>
            </div>
        )
    }

    const menuItems = [
        { name: "Thông tin cá nhân", href: "/user/profile", icon: User },
        { name: "Đơn hàng của tôi", href: "/user/orders", icon: ShoppingBag }
    ]

    return (
        <div className="flex min-h-screen bg-zinc-950 text-white">
            {/* Sidebar */}
            <aside className="w-64 border-r border-zinc-800 bg-zinc-900/50 backdrop-blur-xl flex flex-col fixed h-screen z-30">
                <div className="h-20 flex items-center px-8 border-b border-zinc-800">
                    <Link href="/" className="flex items-center gap-2 group">
                        <span className="text-xl font-black tracking-tighter text-primary">
                            ELEVEN
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

                <div className="p-4 space-y-2 border-t border-zinc-800">
                    <div className="px-4 py-3 rounded-xl bg-zinc-800/30 border border-zinc-800">
                        <div className="text-xs text-zinc-400">Đăng nhập với</div>
                        <div className="font-bold text-sm mt-1">{user?.hoTen}</div>
                    </div>
                    <Button
                        variant="ghost"
                        className="w-full justify-start gap-3 text-zinc-400 hover:text-white hover:bg-zinc-800"
                        onClick={() => router.push("/")}
                    >
                        <Home className="h-5 w-5" />
                        Trang chủ
                    </Button>
                    <Button
                        variant="ghost"
                        className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={handleLogout}
                    >
                        <LogOut className="h-5 w-5" />
                        Đăng xuất
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 pl-64 min-h-screen">
                <div className="p-8 md:p-12 max-w-6xl mx-auto space-y-8">
                    {children}
                </div>
            </main>
        </div>
    )
}
