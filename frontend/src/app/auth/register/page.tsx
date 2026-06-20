"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Loader2, UserPlus, User, Mail, Phone, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { apiRequest } from "@/lib/api-client"

export default function RegisterPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")

  const [formData, setFormData] = useState({
    hoTen: "",
    taiKhoan: "",
    matKhau: "",
    email: "",
    sdt: ""
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Cập nhật dữ liệu form khi người dùng nhập vào input
    setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }))
    // Xóa thông báo lỗi khi người dùng bắt đầu nhập
    if (error) setError("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    // Ngăn chặn hành động mặc định của form
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      // Gọi API để đăng ký tài khoản mới
      const data = await apiRequest("/auth/register", {
        method: "POST",
        body: JSON.stringify(formData)
      })

      // Lưu token vào localStorage (tự động đăng nhập sau khi đăng ký thành công)
      localStorage.setItem("token", data.token)
      localStorage.setItem("user", JSON.stringify(data.user))

      // Kích hoạt sự kiện login-success cho navbar cập nhật
      window.dispatchEvent(new Event("login-success"))

      // Chuyển hướng về trang chủ
      router.push("/")
      router.refresh()
    } catch (err: any) {
      // Hiển thị thông báo lỗi nếu đăng ký thất bại
      setError(err.message || "Registration failed. Please try again.")
    } finally {
      // Tắt trạng thái loading
      setIsLoading(false)
    }
  }

  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-16rem)] py-12">
      <div className="w-full max-w-lg space-y-8 rounded-2xl border bg-card p-8 shadow-xl transition-all hover:shadow-2xl">
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <UserPlus className="h-6 w-6" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Create New Account</h1>
          <p className="text-muted-foreground">Join ELEVEN for an amazing shopping experience</p>
        </div>

        {error && (
          <div className="rounded-lg bg-destructive/10 p-3 text-sm font-medium text-destructive text-center">
            {error}
          </div>
        )}

        <form className="grid grid-cols-1 gap-5 md:grid-cols-2" onSubmit={handleSubmit}>
          <div className="space-y-2 md:col-span-2">
            <label htmlFor="hoTen" className="text-sm font-medium leading-none">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                id="hoTen"
                type="text"
                value={formData.hoTen}
                onChange={handleChange}
                placeholder="John Doe"
                className="flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="taiKhoan" className="text-sm font-medium leading-none">Username</label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                id="taiKhoan"
                type="text"
                value={formData.taiKhoan}
                onChange={handleChange}
                placeholder="username123"
                className="flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium leading-none">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="name@example.com"
                className="flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="sdt" className="text-sm font-medium leading-none">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                id="sdt"
                type="tel"
                value={formData.sdt}
                onChange={handleChange}
                placeholder="+1234567890"
                className="flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="matKhau" className="text-sm font-medium leading-none">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                id="matKhau"
                type={showPassword ? "text" : "password"}
                value={formData.matKhau}
                onChange={handleChange}
                placeholder="••••••••"
                className="flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-10 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Button type="submit" className="w-full rounded-lg h-11 md:col-span-2 mt-2" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...
              </>
            ) : (
              "Create Account"
            )}
          </Button>
        </form>

        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">Or sign up with</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Button variant="outline" className="rounded-lg h-10">
            Google
          </Button>
          <Button variant="outline" className="rounded-lg h-10">
            Facebook
          </Button>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/auth/login" className="font-semibold text-primary hover:underline transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
