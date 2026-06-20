"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { apiRequest } from "@/lib/api-client"

interface Category {
    _id: string
    tenDM: string
}

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    useEffect(() => {
        const load = async () => {
            setLoading(true)
            try {
                const data = await apiRequest('/categories')
                setCategories(data)
            } catch (err: any) {
                setError(err.message || 'Không thể tải danh mục')
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [])

    if (loading) return <div className="container py-24 text-center text-zinc-400">Đang tải danh mục...</div>
    if (error) return <div className="container py-24 text-center text-destructive">{error}</div>

    return (
        <div className="container py-12">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-4xl font-extrabold">Danh mục sản phẩm</h1>
                    <p className="text-zinc-400 mt-1">Chọn danh mục để xem sản phẩm tương ứng.</p>
                </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6">
                {categories.map((cat) => (
                    <Link key={cat._id} href={`/categories/${cat._id}`} className="group flex flex-col items-center justify-center gap-3 rounded-2xl border bg-card p-6 hover:shadow-xl hover:border-primary transition-all">
                        <div className="text-4xl">📦</div>
                        <div className="text-sm font-black uppercase tracking-wider text-muted-foreground group-hover:text-primary">{cat.tenDM}</div>
                    </Link>
                ))}
            </div>
        </div>
    )
}
