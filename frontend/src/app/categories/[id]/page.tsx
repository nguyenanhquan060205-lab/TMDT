"use client"

import { useEffect, useState } from "react"
import { apiRequest } from "@/lib/api-client"
import { ProductCard } from "@/components/shared/product-card"

interface Product {
    _id: string
    tenSP: string
    gia: number
    hinhAnh: string[]
}

export default function CategoryDetailPage({ params }: { params: { id: string } }) {
    const { id } = params
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    useEffect(() => {
        const load = async () => {
            setLoading(true)
            try {
                const data = await apiRequest(`/products?category=${id}`)
                setProducts(data)
            } catch (err: any) {
                setError(err.message || 'Không thể tải sản phẩm')
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [id])

    if (loading) return <div className="container py-24 text-center text-zinc-400">Đang tải sản phẩm...</div>
    if (error) return <div className="container py-24 text-center text-destructive">{error}</div>

    return (
        <div className="container py-12">
            <h2 className="text-3xl font-extrabold mb-6">Sản phẩm trong danh mục</h2>
            {products.length === 0 ? (
                <div className="rounded-xl border border-dashed p-8 text-center text-zinc-500">Chưa có sản phẩm trong danh mục này.</div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {products.map((p) => (
                        <ProductCard key={p._id} id={p._id} name={p.tenSP} price={p.gia} image={p.hinhAnh?.[0] || ''} />
                    ))}
                </div>
            )}
        </div>
    )
}
