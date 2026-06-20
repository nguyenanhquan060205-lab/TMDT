"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DollarSign, ShoppingBag, ClipboardList, Clock, Loader2, RefreshCw } from "lucide-react"
import { apiRequest } from "@/lib/api-client"

interface Order {
  _id: string
  user: {
    hoTen: string
    taiKhoan: string
  }
  tongTien: number
  trangThai: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  phuongThucThanhToan: 'COD' | 'banking'
  trangThaiThanhToan: 'unpaid' | 'paid' | 'failed'
  createdAt: string
}

export default function AdminDashboardPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [totalProducts, setTotalProducts] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  const loadDashboardData = async () => {
    setIsLoading(true)
    setError("")
    try {
      // Gọi song song API lấy danh sách đơn hàng và danh sách sản phẩm
      const [ordersData, productsData] = await Promise.all([
        apiRequest("/orders/admin/all"),
        apiRequest("/products")
      ])
      setOrders(ordersData)
      setTotalProducts(productsData.length)
    } catch (err: any) {
      setError(err.message || "Không thể tải dữ liệu thống kê.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadDashboardData()
  }, [])

  // Tính toán thống kê
  const totalRevenue = orders
    .filter(order => order.trangThaiThanhToan === 'paid')
    .reduce((acc, order) => acc + order.tongTien, 0)

  const totalOrders = orders.length

  const pendingOrders = orders.filter(order => order.trangThai === 'pending').length

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

  const getPaymentStatusBadge = (status: string) => {
    const badges = {
      unpaid: "bg-orange-500/10 text-orange-500 border border-orange-500/20",
      paid: "bg-green-500/10 text-green-500 border border-green-500/20",
      failed: "bg-destructive/10 text-destructive border border-destructive/20"
    }
    return badges[status as keyof typeof badges] || "bg-zinc-800 text-zinc-400"
  }

  const getPaymentStatusText = (status: string) => {
    const texts = {
      unpaid: "Chưa thanh toán",
      paid: "Đã thanh toán",
      failed: "Thanh toán lỗi"
    }
    return texts[status as keyof typeof texts] || status
  }

  if (isLoading) {
    return (
      <div className="flex h-[60vh] w-full flex-col items-center justify-center gap-4 text-zinc-400">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="font-semibold">Đang tải dữ liệu tổng quan...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight">Hệ thống Thống kê</h1>
          <p className="text-zinc-400 mt-1">Tổng quan hoạt động kinh doanh của cửa hàng.</p>
        </div>
        <button 
          onClick={loadDashboardData}
          className="flex items-center gap-2 text-sm font-bold text-primary hover:text-primary/80 transition-colors bg-zinc-900 border border-zinc-800 px-4 py-2.5 rounded-xl"
        >
          <RefreshCw className="h-4 w-4" /> Tải lại dữ liệu
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm font-medium text-destructive">
          {error}
        </div>
      )}

      {/* Grid Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Doanh thu */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 flex items-center justify-between shadow-lg">
          <div className="space-y-1.5">
            <span className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Tổng doanh thu</span>
            <h3 className="text-2xl font-black text-primary">
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalRevenue)}
            </h3>
          </div>
          <div className="p-4 bg-primary/10 rounded-2xl text-primary">
            <DollarSign className="h-6 w-6" />
          </div>
        </div>

        {/* Đơn hàng */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 flex items-center justify-between shadow-lg">
          <div className="space-y-1.5">
            <span className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Số đơn hàng</span>
            <h3 className="text-2xl font-black">{totalOrders}</h3>
          </div>
          <div className="p-4 bg-blue-500/10 rounded-2xl text-blue-500">
            <ClipboardList className="h-6 w-6" />
          </div>
        </div>

        {/* Sản phẩm */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 flex items-center justify-between shadow-lg">
          <div className="space-y-1.5">
            <span className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Tổng sản phẩm</span>
            <h3 className="text-2xl font-black">{totalProducts}</h3>
          </div>
          <div className="p-4 bg-purple-500/10 rounded-2xl text-purple-500">
            <ShoppingBag className="h-6 w-6" />
          </div>
        </div>

        {/* Đơn hàng chờ xử lý */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 flex items-center justify-between shadow-lg">
          <div className="space-y-1.5">
            <span className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Chờ xử lý</span>
            <h3 className="text-2xl font-black text-yellow-500">{pendingOrders}</h3>
          </div>
          <div className="p-4 bg-yellow-500/10 rounded-2xl text-yellow-500">
            <Clock className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Bảng đơn hàng gần đây */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
          <h2 className="text-xl font-bold">Đơn hàng gần đây</h2>
          <span className="text-xs bg-zinc-800 px-3 py-1 rounded-full text-zinc-400 font-bold">
            Hiển thị {orders.slice(0, 10).length} đơn
          </span>
        </div>

        {orders.length === 0 ? (
          <div className="p-12 text-center text-zinc-500">
            Hệ thống chưa có đơn hàng nào phát sinh.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-zinc-900 border-b border-zinc-800 text-zinc-400 text-xs uppercase tracking-wider">
                  <th className="p-5 font-extrabold">Mã đơn hàng</th>
                  <th className="p-5 font-extrabold">Khách hàng</th>
                  <th className="p-5 font-extrabold">Ngày đặt</th>
                  <th className="p-5 font-extrabold">Tổng tiền</th>
                  <th className="p-5 font-extrabold">Thanh toán</th>
                  <th className="p-5 font-extrabold">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800 bg-zinc-900/20">
                {orders.slice(0, 10).map((order) => (
                  <tr key={order._id} className="hover:bg-zinc-800/40 transition-colors">
                    <td className="p-5 font-bold font-mono text-zinc-300 text-xs">
                      #{order._id.substring(18)}
                    </td>
                    <td className="p-5">
                      <div className="font-bold">{order.user?.hoTen || "Không tên"}</div>
                      <div className="text-xs text-zinc-500 font-medium">@{order.user?.taiKhoan || "guest"}</div>
                    </td>
                    <td className="p-5 text-zinc-400 font-medium">
                      {new Date(order.createdAt).toLocaleDateString('vi-VN', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="p-5 font-extrabold text-primary">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.tongTien)}
                    </td>
                    <td className="p-5">
                      <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${getPaymentStatusBadge(order.trangThaiThanhToan)}`}>
                        {getPaymentStatusText(order.trangThaiThanhToan)}
                      </span>
                    </td>
                    <td className="p-5">
                      <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${getStatusBadge(order.trangThai)}`}>
                        {getStatusText(order.trangThai)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
