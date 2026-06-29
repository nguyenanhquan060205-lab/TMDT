"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { apiRequest } from "@/lib/api-client"
import { useGoogleLogin } from "@react-oauth/google"

export default function RegisterPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({ taiKhoan: "", matKhau: "" })

  const handleChange = (e: any) => {
    setFormData(p => ({ ...p, [e.target.id]: e.target.value }))
    if (error) setError("")
  }

  const onSuccess = (data: any) => {
    localStorage.setItem("token", data.token)
    localStorage.setItem("user", JSON.stringify(data.user))
    window.dispatchEvent(new Event("register-success"))
    router.push("/")
    router.refresh()
  }

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    setIsLoading(true); setError("")
    try { onSuccess(await apiRequest("/auth/register", { method: "POST", body: JSON.stringify(formData) })) }
    catch (err: any) { setError(err.message || "Login failed.") }
    finally { setIsLoading(false) }
  }

  const googleLoginHook = useGoogleLogin({
    onSuccess: async (r) => {
      setIsLoading(true); setError("")
      try { onSuccess(await apiRequest("/auth/google", { method: "POST", body: JSON.stringify({ id_token: r.access_token }) })) }
      catch (err: any) { setError(err.message || "Google register failed.") }
      finally { setIsLoading(false) }
    }, onError: () => setError("Google register failed.")
  })

  const fbLogin = () => {
    const FB = (window as any).FB
    if (!FB) { setError("Facebook SDK not loaded."); return }
    FB.register(async (r: any) => {
      if (!r.authResponse) { setError("FB register cancelled."); return }
      setIsLoading(true); setError("")
      try { onSuccess(await apiRequest("/auth/facebook", { method: "POST", body: JSON.stringify({ access_token: r.authResponse.accessToken }) })) }
      catch (err: any) { setError(err.message || "FB register failed.") }
      finally { setIsLoading(false) }
    }, { scope: "public_profile,email" })
  }

  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-16rem)] py-12">
      <div className="w-full max-w-md space-y-8 border bg-card p-8 rounded-2xl shadow-xl">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Create Account</h1>
          <p className="text-muted-foreground text-sm">Sign up to your account</p>
        </div>
        {error && <div className="bg-destructive/10 p-3 text-sm text-destructive rounded-lg">{error}</div>}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <input id="taiKhoan" value={formData.taiKhoan} onChange={handleChange} placeholder="Username" required
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
          <div className="relative">
            <input id="matKhau" type={showPassword ? "text" : "password"} value={formData.matKhau} onChange={handleChange}
              placeholder="Password" required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm pr-10" />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-2.5">
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <Button type="submit" className="w-full h-11" disabled={isLoading}>
            {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing in...</> : "Sign Up"}
          </Button>
        </form>
        <div className="relative"><div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
          <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">Or continue with</span></div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Button variant="outline" className="h-10" onClick={googleLoginHook.click} disabled={isLoading}>
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg> Google
          </Button>
          <Button variant="outline" className="h-10" onClick={fbLogin} disabled={isLoading}>
            <svg className="mr-2 h-4 w-4" fill="#1877F2" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg> Facebook
          </Button>
        </div>
        <p className="text-center text-sm text-muted-foreground">
          No account? <Link href="/auth/register" className="font-semibold text-primary hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  )
}
