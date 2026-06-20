"use client"

import { useEffect, useState } from "react"
import { ClipboardList, Loader2, RefreshCw, Check, Edit2, X, CreditCard } from "lucide-react"
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

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null)
  
  // Trạng thái tạm thời khi chỉnh sửa
  const [tempStatus, setTempStatus] = useState<Order['trangThai']>('pending')
  const [tempPaymentStatus, setTempPaymentStatus] = useState<Order['trangThaiThanhToan']>('unpaid')

  const fetchOrders = async () => {
    setIsLoading(true)
    setError("")
    try {
      const data = await apiRequest("/orders/admin/all")
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

  const handleStartUpdate = (order: Order) => {
    setUpdatingOrderId(order._id)
    setTempStatus(order.trangThai)
    setTempPaymentStatus(order.trangThaiThanhToan)
  }

  const handleCancelUpdate = () => {
    setUpdatingOrderId(null)
  }

  const handleSaveUpdate = async (orderId: string) => {
    try {
      await apiRequest(`/orders/admin/status/${orderId}`, {
        method: "PUT",
        body: JSON.stringify({
          trangThai: tempStatus,
          trangThaiThanhToan: tempPaymentStatus
        })
      })
      
      // Cập nhật lại state local
      setOrders(prev => prev.map(order => {
        if (order._id === orderId) {
          return {
            ...order,
            trangThai: tempStatus,
            trangThaiThanhToan: tempPaymentStatus
          }
        }
        return order
      }))
      setUpdatingOrderId(null)
    } catch (err: any) {
      alert(err.message || "Cập nhật trạng thái đơn hàng thất bại.")
    }
  }

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
          <h1 className="text-4xl font-extrabold tracking-tight">Quản lý Đơn hàng</h1>
          <p className="text-zinc-400 mt-1">Xem, duyệt đơn hàng và cập nhật tiến độ vận chuyển.</p>
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

      {/* Danh sách đơn hàng */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-zinc-800">
          <h2 className="text-xl font-bold">Tất cả đơn đặt hàng ({orders.length})</h2>
        </div>

        {orders.length === 0 ? (
          <div className="p-12 text-center text-zinc-500">
            Chưa phát sinh đơn đặt hàng nào trên hệ thống.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-zinc-900 border-b border-zinc-800 text-zinc-400 text-xs uppercase tracking-wider">
                  <th className="p-5 font-extrabold">Mã đơn</th>
                  <th className="p-5 font-extrabold">Khách hàng / Liên hệ</th>
                  <th className="p-5 font-extrabold">Thông tin sản phẩm</th>
                  <th className="p-5 font-extrabold">Tổng tiền</th>
                  <th className="p-5 font-extrabold">Thanh toán</th>
                  <th className="p-5 font-extrabold">Vận chuyển</th>
                  <th className="p-5 font-extrabold text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800 bg-zinc-900/20">
                {orders.map((order) => {
                  const isEditing = updatingOrderId === order._id
                  return (
                    <tr key={order._id} className="hover:bg-zinc-800/40 transition-colors align-top">
                      {/* Mã đơn */}
                      <td className="p-5 font-bold font-mono text-zinc-400 text-xs">
                        #{order._id.substring(18)}
                        <span className="block font-medium text-[10px] text-zinc-600 mt-1">
                          {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                      </td>

                      {/* Khách hàng */}
                      <td className="p-5">
                        <div className="font-extrabold text-zinc-200">{order.user?.hoTen || "Không tên"}</div>
                        <div className="text-xs text-zinc-500 font-bold mt-0.5">SĐT: {order.sdtNhanHang}</div>
                        <div className="text-xs text-zinc-500 max-w-[200px] truncate mt-1" title={order.diaChiGiaoHang}>
                          Đ/C: {order.diaChiGiaoHang}
                        </div>
                      </td>

                      {/* Sản phẩm */}
                      <td className="p-5">
                        <div className="space-y-1 max-w-xs">
                          {order.items?.map((item) => (
                            <div key={item._id} className="text-xs flex items-center justify-between text-zinc-400 gap-4">
                              <span className="truncate flex-1 font-medium">{item.product?.tenSP || "Sản phẩm đã xóa"}</span>
                              <span className="shrink-0 font-bold text-zinc-500">x{item.quantity}</span>
                            </div>
                          ))}
                        </div>
                        {order.ghiChu && (
                          <div className="text-[10px] italic text-zinc-500 mt-2 bg-zinc-950 p-2 rounded-lg">
                            Ghi chú: {order.ghiChu}
                          </div>
                        )}
                      </td>

                      {/* Tổng tiền */}
                      <td className="p-5 font-black text-primary text-base">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.tongTien)}
                        <span className="block text-[10px] text-zinc-500 font-medium mt-1">
                          {order.phuongThucThanhToan === 'COD' ? 'Thanh toán COD' : 'Chuyển khoản (sePay)'}
                        </span>
                        {order.maGiaoDich && (
                          <span className="block text-[9px] text-blue-400 bg-blue-500/10 px-1 py-0.5 rounded w-max mt-1 font-mono">
                            GD: {order.maGiaoDich}
                          </span>
                        )}
                      </td>

                      {/* Trạng thái thanh toán */}
                      <td className="p-5">
                        {isEditing ? (
                          <select
                            value={tempPaymentStatus}
                            onChange={(e) => setTempPaymentStatus(e.target.value as any)}
                            className="text-xs bg-zinc-950 border border-zinc-800 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary text-white"
                          >
                            <option value="unpaid">Chưa thanh toán</option>
                            <option value="paid">Đã thanh toán</option>
                            <option value="failed">Lỗi thanh toán</option>
                          </select>
                        ) : (
                          <span className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${getPaymentStatusBadge(order.trangThaiThanhToan)}`}>
                            {getPaymentStatusText(order.trangThaiThanhToan)}
                          </span>
                        )}
                      </td>

                      {/* Trạng thái vận chuyển */}
                      <td className="p-5">
                        {isEditing ? (
                          <select
                            value={tempStatus}
                            onChange={(e) => setTempStatus(e.target.value as any)}
                            className="text-xs bg-zinc-950 border border-zinc-800 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary text-white"
                          >
                            <option value="pending">Chờ xử lý</option>
                            <option value="processing">Đang xử lý</option>
                            <option value="shipped">Đang giao hàng</option>
                            <option value="delivered">Đã giao hàng</option>
                            <option value="cancelled">Đã hủy đơn</option>
                          </select>
                        ) : (
                          <span className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${getStatusBadge(order.trangThai)}`}>
                            {getStatusText(order.trangThai)}
                          </span>
                        )}
                      </td>

                      {/* Thao tác */}
                      <td className="p-5 text-right">
                        {isEditing ? (
                          <div className="flex justify-end gap-1">
                            <Button 
                              onClick={() => handleSaveUpdate(order._id)} 
                              size="icon" 
                              variant="ghost" 
                              className="text-green-500 hover:text-green-400 hover:bg-green-500/10 h-8 w-8"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button 
                              onClick={handleCancelUpdate} 
                              size="icon" 
                              variant="ghost" 
                              className="text-zinc-500 hover:text-zinc-400 hover:bg-zinc-800 h-8 w-8"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <Button 
                            onClick={() => handleStartUpdate(order)} 
                            variant="ghost" 
                            size="sm" 
                            className="text-zinc-400 hover:text-white hover:bg-zinc-800 font-bold text-xs gap-1.5"
                          >
                            <Edit2 className="h-3.5 w-3.5" /> Sửa trạng thái
                          </Button>
                        )}
                      </td>

                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
