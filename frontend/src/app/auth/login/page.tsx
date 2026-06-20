"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Loader2, Lock, User as UserIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { apiRequest } from "@/lib/api-client"

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")

  const [formData, setFormData] = useState({
    taiKhoan: "",
    matKhau: ""
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
      // Gọi API để xác thực đăng nhập
      const data = await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify(formData)
      })

      // Lưu token và thông tin người dùng vào localStorage
      localStorage.setItem("token", data.token)
      localStorage.setItem("user", JSON.stringify(data.user))

      // Kích hoạt sự kiện login-success cho navbar cập nhật
      window.dispatchEvent(new Event("login-success"))

      // Chuyển hướng về trang chủ hoặc trang trước đó
      router.push("/")
      router.refresh()
    } catch (err: any) {
      // Hiển thị thông báo lỗi nếu đăng nhập thất bại
      setError(err.message || "Login failed. Please try again.")
    } finally {
      // Tắt trạng thái loading
      setIsLoading(false)
    }
  }

  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-16rem)] py-12">
      <div className="w-full max-w-md space-y-8 rounded-2xl border bg-card p-8 shadow-xl transition-all hover:shadow-2xl">
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Lock className="h-6 w-6" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome Back</h1>
          <p className="text-muted-foreground">Enter your credentials to access your account</p>
        </div>

        {error && (
          <div className="rounded-lg bg-destructive/10 p-3 text-sm font-medium text-destructive text-center">
            {error}
          </div>
        )}

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label htmlFor="taiKhoan" className="text-sm font-medium leading-none">Username</label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                id="taiKhoan"
                type="text"
                value={formData.taiKhoan}
                onChange={handleChange}
                placeholder="Enter username"
                className="flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="matKhau" className="text-sm font-medium leading-none">Password</label>
              <Link href="#" className="text-xs text-primary hover:underline transition-colors">Forgot password?</Link>
            </div>
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
          <Button type="submit" className="w-full rounded-lg h-11 font-bold" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Logging in...
              </>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>

        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
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
          Don't have an account?{" "}
          <Link href="/auth/register" className="font-semibold text-primary hover:underline transition-colors">
            Sign up now
          </Link>
        </p>
      </div>
    </div>
  )
}
