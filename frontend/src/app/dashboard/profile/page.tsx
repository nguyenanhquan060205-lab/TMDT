"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { apiRequest } from "@/lib/api-client"

interface User {
    _id: string
    hoTen: string
    taiKhoan: string
    email: string
    sdt: string
    diaChi: string
    gioiTinh?: string
    ngaySinh?: string
}

export default function ProfilePage() {
    const router = useRouter()
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")

    const [formData, setFormData] = useState({
        hoTen: "",
        email: "",
        sdt: "",
        diaChi: "",
        gioiTinh: "",
        ngaySinh: ""
    })

    useEffect(() => {
        const loadProfile = async () => {
            try {
                setIsLoading(true)
                const data = await apiRequest("/auth/me")
                setUser(data)
                setFormData({
                    hoTen: data.hoTen || "",
                    email: data.email || "",
                    sdt: data.sdt || "",
                    diaChi: data.diaChi || "",
                    gioiTinh: data.gioiTinh || "",
                    ngaySinh: data.ngaySinh ? data.ngaySinh.split('T')[0] : ""
                })
            } catch (err: any) {
                setError(err.message || "Không thể tải thông tin người dùng")
            } finally {
                setIsLoading(false)
            }
        }
        loadProfile()
    }, [])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSaving(true)
        setError("")
        setSuccess("")

        try {
            const response = await apiRequest("/users/profile", {
                method: "PUT",
                body: JSON.stringify(formData)
            })
            setUser(response)
            setSuccess("Cập nhật thông tin thành công!")
            setTimeout(() => setSuccess(""), 3000)
        } catch (err: any) {
            setError(err.message || "Cập nhật thông tin thất bại")
        } finally {
            setIsSaving(false)
        }
    }

    if (isLoading) {
        return (
            <div className="flex h-[60vh] w-full flex-col items-center justify-center gap-4 text-zinc-400">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="font-semibold">Đang tải thông tin...</p>
            </div>
        )
    }

    return (
        <div className="space-y-8 max-w-2xl">
            {/* Header */}
            <div>
                <h1 className="text-4xl font-extrabold">Thông tin cá nhân</h1>
                <p className="text-zinc-400 mt-1">Quản lý và cập nhật thông tin tài khoản của bạn.</p>
            </div>

            {error && (
                <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm font-medium text-destructive">
                    {error}
                </div>
            )}

            {success && (
                <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-4 text-sm font-medium text-green-500">
                    {success}
                </div>
            )}

            {/* Profile Form */}
            <form onSubmit={handleSubmit} className="bg-zinc-900 border border-zinc-800 rounded-3xl shadow-lg p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold">Họ và tên</label>
                        <input
                            type="text"
                            name="hoTen"
                            value={formData.hoTen}
                            onChange={handleChange}
                            className="h-11 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-white"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="h-11 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-white"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold">Số điện thoại</label>
                        <input
                            type="tel"
                            name="sdt"
                            value={formData.sdt}
                            onChange={handleChange}
                            className="h-11 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-white"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold">Giới tính</label>
                        <select
                            name="gioiTinh"
                            value={formData.gioiTinh}
                            onChange={handleChange}
                            className="h-11 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-white"
                        >
                            <option value="">Chọn giới tính</option>
                            <option value="Nam">Nam</option>
                            <option value="Nữ">Nữ</option>
                            <option value="Khác">Khác</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold">Ngày sinh</label>
                        <input
                            type="date"
                            name="ngaySinh"
                            value={formData.ngaySinh}
                            onChange={handleChange}
                            className="h-11 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-white"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-semibold">Địa chỉ giao hàng</label>
                    <input
                        type="text"
                        name="diaChi"
                        value={formData.diaChi}
                        onChange={handleChange}
                        className="h-11 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-white"
                    />
                </div>

                <div className="flex gap-4">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => router.back()}
                        className="flex-1 rounded-xl h-12 text-zinc-400 hover:text-white"
                    >
                        Quay lại
                    </Button>
                    <Button
                        type="submit"
                        disabled={isSaving}
                        className="flex-1 rounded-xl h-12 bg-primary gap-2"
                    >
                        {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                        {isSaving ? "Đang lưu..." : "Cập nhật thông tin"}
                    </Button>
                </div>
            </form>

            {/* Account Info */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl shadow-lg p-8 space-y-4">
                <h2 className="text-xl font-bold">Thông tin tài khoản</h2>
                <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                        <span className="text-zinc-400">Tên tài khoản:</span>
                        <span className="font-bold text-zinc-200">{user?.taiKhoan}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-zinc-400">ID người dùng:</span>
                        <span className="font-mono text-xs text-primary">{user?._id}</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
