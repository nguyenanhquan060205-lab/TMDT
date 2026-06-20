"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Search, ShoppingCart, User, LogOut } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { apiRequest } from "@/lib/api-client"

export function Navbar() {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [isScrolled, setIsScrolled] = useState(false)
  const [cartCount, setCartCount] = useState(0)

  const fetchCartCount = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        setCartCount(0)
        return
      }
      const cart = await apiRequest("/cart")
      const totalItems = cart.items.reduce((acc: number, item: any) => acc + item.quantity, 0)
      setCartCount(totalItems)
    } catch (err) {
      console.error("Lỗi lấy giỏ hàng trên navbar:", err)
      setCartCount(0)
    }
  }

  useEffect(() => {
    // Kiểm tra token đăng nhập từ localStorage khi component tải
    const token = localStorage.getItem("token")
    const userData = localStorage.getItem("user")
    // Nếu có token, đặt trạng thái đã đăng nhập
    if (token && userData) {
      setIsLoggedIn(true)
      setUser(JSON.parse(userData))
      fetchCartCount()
    }

    // Lắng nghe sự kiện cập nhật giỏ hàng
    window.addEventListener("cart-updated", fetchCartCount)
    window.addEventListener("login-success", () => {
      fetchCartCount()
      const updatedUser = localStorage.getItem("user")
      if (updatedUser) {
        setIsLoggedIn(true)
        setUser(JSON.parse(updatedUser))
      }
    })

    // Lăng nghe sự kiện scroll để căn chỉnh giao diện navbar
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    // Dập event listener khi component unmount
    return () => {
      window.removeEventListener("scroll", handleScroll)
      window.removeEventListener("cart-updated", fetchCartCount)
    }
  }, [])

  const handleLogout = () => {
    // Xóa token và thông tin người dùng khi đăng xuất
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    // Đặt lại trạng thái đăng nhập
    setIsLoggedIn(false)
    setUser(null)
    setCartCount(0)
    // Chuyển hướng về trang đăng nhập
    router.push("/auth/login")
    router.refresh()
  }

  return (
    <header className={`sticky top-0 z-50 w-full transition-all duration-300 ${isScrolled
      ? "border-b bg-background/80 backdrop-blur-xl shadow-sm"
      : "bg-transparent"
      }`}>
      <div className="container flex h-20 items-center justify-between">
        <div className="flex items-center gap-12">
          <Link href="/" className="flex items-center space-x-2 group">
            <motion.span
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="text-2xl font-black tracking-tighter text-primary"
            >
              ELEVEN
            </motion.span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm font-bold uppercase tracking-wider">
            {["Products", "Categories", "Deals"].map((item, index) => (
              <Link
                key={item}
                href={item === "Products" ? "/products" : item === "Categories" ? "/categories" : "/deals"}
                className="relative transition-colors hover:text-primary group py-2"
              >
                {item}
                <motion.span
                  className="absolute bottom-0 left-0 h-0.5 w-0 bg-primary transition-all group-hover:w-full"
                  layoutId="navUnderline"
                />
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex flex-1 items-center justify-center px-8 md:max-w-md">
          <div className="relative w-full group">
            <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-muted-foreground transition-colors group-focus-within:text-primary" />
            <input
              type="search"
              placeholder="Search products..."
              className="h-10 w-full rounded-full border border-input bg-background/50 pl-10 pr-4 py-2 text-sm shadow-sm transition-all focus:bg-background focus:ring-2 focus:ring-primary/20 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Button variant="ghost" size="icon" asChild className="relative rounded-full hover:bg-primary/10">
              <Link href="/cart">
                <ShoppingCart className="h-5.5 w-5.5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                    {cartCount}
                  </span>
                )}
                <span className="sr-only">Cart</span>
              </Link>
            </Button>
          </motion.div>

          {isLoggedIn ? (
            <div className="flex items-center gap-3">
              <Button variant="ghost" className="gap-3 rounded-full pl-1 pr-4 hover:bg-primary/5">
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-black text-xs">
                  {user?.hoTen?.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:inline-block text-sm font-bold">{user?.hoTen}</span>
              </Button>
              <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout" className="rounded-full hover:text-destructive">
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          ) : (
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button variant="ghost" size="icon" asChild className="rounded-full hover:bg-primary/10">
                <Link href="/auth/login">
                  <User className="h-5.5 w-5.5" />
                  <span className="sr-only">Account</span>
                </Link>
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </header>
  )
}
