"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Loader2, MapPin, Phone, Package, CreditCard, Truck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { apiRequest } from "@/lib/api-client"

interface OrderItem {
    product: {
        _id: string
        tenSP: string
        hinhAnh: string[]
        gia: number
    }
    quantity: number
    price: number
    _id: string
}

interface Order {
    _id: string
    user: {
        hoTen: string
        taiKhoan: string
    }
    items: OrderItem[]
    tongTien: number
    diaChiGiaoHang: string
    sdtNhanHang: string
    ghiChu?: string
    trangThai: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
    phuongThucThanhToan: 'COD' | 'banking'
    trangThaiThanhToan: 'unpaid' | 'paid' | 'failed'
    maGiaoDich?: string
    createdAt: string
}

export default function OrderDetailPage({ params }: { params: { id: string } }) {
    const { id } = params
    const [order, setOrder] = useState<Order | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState("")

    useEffect(() => {
        const loadOrder = async () => {
            try {
                setIsLoading(true)
                const data = await apiRequest(`/orders/${id}`)
                setOrder(data)
            } catch (err: any) {
                setError(err.message || "Không thể tải chi tiết đơn hàng")
            } finally {
                setIsLoading(false)
            }
        }
        loadOrder()
    }, [id])

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
                <p className="font-semibold">Đang tải chi tiết đơn hàng...</p>
            </div>
        )
    }

    if (error || !order) {
        return (
            <div className="space-y-4">
                <Button asChild variant="ghost" className="gap-2">
                    <Link href="/dashboard/orders">
                        <ArrowLeft className="h-4 w-4" /> Quay lại
                    </Link>
                </Button>
                <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center space-y-4">
                    <p className="text-destructive font-medium">{error || "Không tìm thấy đơn hàng"}</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <Button asChild variant="ghost" className="gap-2">
                <Link href="/dashboard/orders">
                    <ArrowLeft className="h-4 w-4" /> Quay lại danh sách
                </Link>
            </Button>

            {/* Order Header */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 space-y-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black">Đơn hàng #{order._id.substring(18)}</h1>
                        <p className="text-zinc-400 text-sm mt-1">{new Date(order.createdAt).toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                    <div className="space-y-2">
                        <div className={`px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wider w-fit ${getStatusBadge(order.trangThai)}`}>
                            {getStatusText(order.trangThai)}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-zinc-800">
                    <div className="space-y-2">
                        <p className="text-sm text-zinc-400 font-semibold">Tổng tiền</p>
                        <p className="text-2xl font-black text-primary">
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.tongTien)}
                        </p>
                    </div>
                    <div className="space-y-2">
                        <p className="text-sm text-zinc-400 font-semibold">Thanh toán</p>
                        <p className="font-bold">{getPaymentStatusText(order.trangThaiThanhToan)}</p>
                        <p className="text-xs text-zinc-500">{order.phuongThucThanhToan === 'COD' ? 'Thanh toán khi nhận' : 'Chuyển khoản'}</p>
                    </div>
                    <div className="space-y-2">
                        <p className="text-sm text-zinc-400 font-semibold">Vận chuyển</p>
                        <p className="font-bold">{getStatusText(order.trangThai)}</p>
                    </div>
                </div>
            </div>

            {/* Order Items */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 space-y-6">
                <h2 className="text-2xl font-black">Chi tiết sản phẩm</h2>
                <div className="space-y-4">
                    {order.items?.map((item) => (
                        <div key={item._id} className="flex gap-4 p-4 rounded-xl border border-zinc-800 hover:border-primary/50 transition-colors">
                            <div className="h-20 w-20 rounded-lg border bg-white flex items-center justify-center shrink-0 overflow-hidden">
                                <img
                                    src={item.product?.hinhAnh?.[0] || "https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=100&q=80"}
                                    alt={item.product?.tenSP}
                                    className="object-contain w-full h-full p-1"
                                />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-lg">{item.product?.tenSP || "Sản phẩm đã xóa"}</h3>
                                <div className="flex items-center gap-4 mt-2 text-sm">
                                    <span className="text-zinc-400">Số lượng: <span className="font-bold text-white">{item.quantity}</span></span>
                                    <span className="text-zinc-400">Đơn giá: <span className="font-bold text-white">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price)}</span></span>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-zinc-400">Tổng cộng</p>
                                <p className="text-xl font-black text-primary">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price * item.quantity)}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Shipping & Contact Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Shipping Address */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 space-y-4">
                    <div className="flex items-center gap-3">
                        <MapPin className="h-6 w-6 text-primary" />
                        <h2 className="text-xl font-black">Địa chỉ giao hàng</h2>
                    </div>
                    <div className="space-y-3">
                        <div>
                            <p className="text-sm text-zinc-400">Người nhận</p>
                            <p className="font-bold">{order.user?.hoTen}</p>
                        </div>
                        <div>
                            <p className="text-sm text-zinc-400">Địa chỉ</p>
                            <p className="font-bold">{order.diaChiGiaoHang}</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Phone className="h-5 w-5 text-primary" />
                            <p className="font-bold">{order.sdtNhanHang}</p>
                        </div>
                    </div>
                </div>

                {/* Additional Info */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 space-y-4">
                    <div className="flex items-center gap-3">
                        <Package className="h-6 w-6 text-primary" />
                        <h2 className="text-xl font-black">Thông tin đơn hàng</h2>
                    </div>
                    <div className="space-y-3">
                        <div>
                            <p className="text-sm text-zinc-400">Phương thức thanh toán</p>
                            <p className="font-bold">{order.phuongThucThanhToan === 'COD' ? 'Thanh toán khi nhận (COD)' : 'Chuyển khoản ngân hàng'}</p>
                        </div>
                        {order.maGiaoDich && (
                            <div>
                                <p className="text-sm text-zinc-400">Mã giao dịch</p>
                                <p className="font-mono text-sm bg-blue-500/10 px-2 py-1 rounded text-blue-400">{order.maGiaoDich}</p>
                            </div>
                        )}
                        {order.ghiChu && (
                            <div>
                                <p className="text-sm text-zinc-400">Ghi chú</p>
                                <p className="font-medium">{order.ghiChu}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
