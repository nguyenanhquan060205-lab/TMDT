"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Loader2, RefreshCw, ChevronRight, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { apiRequest } from "@/lib/api-client"

interface OrderItem {
    product: {
        _id: string
        tenSP: string
        hinhAnh: string[]
    }
    quantity: number
    price: number
    _id: string
}

interface Order {
    _id: string
    items: OrderItem[]
    tongTien: number
    diaChiGiaoHang: string
    sdtNhanHang: string
    trangThai: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
    phuongThucThanhToan: 'COD' | 'banking'
    trangThaiThanhToan: 'unpaid' | 'paid' | 'failed'
    createdAt: string
}

export default function UserOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState("")

    const fetchOrders = async () => {
        setIsLoading(true)
        setError("")
        try {
            const data = await apiRequest("/orders/my-orders")
            setOrders(data)
        } catch (err: any) {
            setError(err.message || "Không thể lấy danh sách đơn hàng.")
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchOrders()
    }, [])

    const getStatusBadge = (status: string) => {
        const badges = {
            pending: "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20",
            processing: "bg-blue-500/10 text-blue-500 border border-blue-500/20",
            shipped: "bg-purple-500/10 text-purple-500 border border-purple-500/20",
            delivered: "bg-green-500/10 text-green-500 border border-green-500/20",
            cancelled: "bg-destructive/10 text-destructive border border-destructive/20"
        }
        return badges[status as keyof typeof badges] || "bg-zinc-800 text-zinc-400"
    }

    const getStatusText = (status: string) => {
        const texts = {
            pending: "Chờ xử lý",
            processing: "Đang xử lý",
            shipped: "Đang giao hàng",
            delivered: "Đã giao hàng",
            cancelled: "Đã hủy đơn"
        }
        return texts[status as keyof typeof texts] || status
    }

    const getPaymentStatusText = (status: string) => {
        const texts = {
            unpaid: "Chưa thanh toán",
            paid: "Đã thanh toán",
            failed: "Lỗi thanh toán"
        }
        return texts[status as keyof typeof texts] || status
    }

    if (isLoading) {
        return (
            <div className="flex h-[60vh] w-full flex-col items-center justify-center gap-4 text-zinc-400">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="font-semibold">Đang tải danh sách đơn hàng...</p>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight">Đơn hàng của tôi</h1>
                    <p className="text-zinc-400 mt-1">Xem lịch sử và chi tiết các đơn hàng của bạn.</p>
                </div>
                <button
                    onClick={fetchOrders}
                    className="flex items-center gap-2 text-sm font-bold text-primary hover:text-primary/80 transition-colors bg-zinc-900 border border-zinc-800 px-4 py-2.5 rounded-xl"
                >
                    <RefreshCw className="h-4 w-4" /> Làm mới
                </button>
            </div>

            {error && (
                <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm font-medium text-destructive">
                    {error}
                </div>
            )}

            {/* Orders List */}
            {orders.length === 0 ? (
                <div className="rounded-xl border border-dashed border-zinc-800 p-12 text-center space-y-4">
                    <div className="text-5xl">📦</div>
                    <h3 className="text-xl font-bold">Chưa có đơn hàng nào</h3>
                    <p className="text-zinc-400">Bắt đầu mua sắm ngay để tạo đơn hàng của bạn.</p>
                    <Button asChild className="bg-primary rounded-xl">
                        <Link href="/products">Xem sản phẩm</Link>
                    </Button>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map((order) => (
                        <Link
                            key={order._id}
                            href={`/user/orders/${order._id}`}
                            className="group bg-zinc-900 border border-zinc-800 rounded-3xl p-6 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 transition-all"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                                {/* Order ID & Date */}
                                <div className="space-y-1">
                                    <p className="text-xs text-zinc-500 font-semibold uppercase">Mã đơn</p>
                                    <p className="font-mono font-bold text-sm">#{order._id.substring(18)}</p>
                                    <p className="text-xs text-zinc-500 mt-1">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</p>
                                </div>

                                {/* Products */}
                                <div className="space-y-1">
                                    <p className="text-xs text-zinc-500 font-semibold uppercase">Sản phẩm</p>
                                    <p className="font-bold text-sm">{order.items.length} sản phẩm</p>
                                    <div className="text-xs text-zinc-400 mt-1 space-y-0.5">
                                        {order.items.slice(0, 2).map((item) => (
                                            <div key={item._id} className="truncate">{item.product?.tenSP}</div>
                                        ))}
                                        {order.items.length > 2 && <div>+{order.items.length - 2} khác</div>}
                                    </div>
                                </div>

                                {/* Total */}
                                <div className="space-y-1">
                                    <p className="text-xs text-zinc-500 font-semibold uppercase">Tổng tiền</p>
                                    <p className="font-black text-lg text-primary">
                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.tongTien)}
                                    </p>
                                </div>

                                {/* Status */}
                                <div className="space-y-1">
                                    <p className="text-xs text-zinc-500 font-semibold uppercase">Vận chuyển</p>
                                    <span className={`inline-block px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider ${getStatusBadge(order.trangThai)}`}>
                                        {getStatusText(order.trangThai)}
                                    </span>
                                    <p className="text-xs text-zinc-400 mt-1">{getPaymentStatusText(order.trangThaiThanhToan)}</p>
                                </div>

                                {/* Action */}
                                <div className="flex justify-end">
                                    <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-800/50 group-hover:bg-primary/20 text-zinc-400 group-hover:text-primary transition-colors">
                                        <Eye className="h-4 w-4" />
                                        <span className="text-sm font-bold">Chi tiết</span>
                                        <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}
