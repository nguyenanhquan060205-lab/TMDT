"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Loader2, ArrowLeft, CheckCircle2, QrCode, CreditCard, ShoppingBag, Truck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { apiRequest } from "@/lib/api-client"

interface CartItem {
  product: {
    _id: string
    tenSP: string
    gia: number
    hinhAnh: string[]
  }
  quantity: number
  _id: string
}

interface Cart {
  _id: string
  items: CartItem[]
}

interface Order {
  _id: string
  tongTien: number
  phuongThucThanhToan: string
  trangThaiThanhToan: string
  diaChiGiaoHang: string
  sdtNhanHang: string
}

export default function CheckoutPage() {
  const router = useRouter()
  const [cart, setCart] = useState<Cart | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  // Form states
  const [hoTen, setHoTen] = useState("")
  const [sdtNhanHang, setSdtNhanHang] = useState("")
  const [diaChiGiaoHang, setDiaChiGiaoHang] = useState("")
  const [ghiChu, setGhiChu] = useState("")
  const [phuongThucThanhToan, setPhuongThucThanhToan] = useState<'COD' | 'banking'>('COD')

  // Order success states
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null)
  const [isPaymentPaid, setIsPaymentPaid] = useState(false)
  const [maGiamGia, setMaGiamGia] = useState("")

  // Cấu hình tài khoản ngân hàng để tạo mã VietQR
  const bankConfig = {
    bankId: "ICB", // MB Bank hoặc Vietinbank (Ví dụ: ICB là Vietinbank, MB là MBBank, VCB là Vietcombank)
    accountNo: "101876543210", // Số tài khoản mẫu
    accountName: "CONG TY TNHH HUIT SHOP" // Tên người thụ hưởng
  }

  useEffect(() => {
    const fetchCart = async () => {
      const token = localStorage.getItem("token")
      const userStr = localStorage.getItem("user")
      if (!token || !userStr) {
        router.push("/auth/login")
        return
      }

      // Pre-fill user name and phone if available
      try {
        const user = JSON.parse(userStr)
        setHoTen(user.hoTen || "")
        setSdtNhanHang(user.sdt || "")
        setDiaChiGiaoHang(user.diaChi || "")
      } catch (e) {
        console.error(e)
      }

      // Lấy mã giảm giá đã chọn từ giỏ hàng
      const savedPromo = localStorage.getItem("appliedPromoCode")
      if (savedPromo) {
        setMaGiamGia(savedPromo)
      }

      try {
        const data = await apiRequest("/cart")
        if (data.items.length === 0) {
          router.push("/cart")
          return
        }
        setCart(data)
      } catch (err: any) {
        setError(err.message || "Không thể tải thông tin giỏ hàng.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchCart()
  }, [])

  // Theo dõi trạng thái đơn hàng khi chọn thanh toán Banking để phát hiện sePay xác nhận thành công
  useEffect(() => {
    if (!createdOrder || createdOrder.phuongThucThanhToan !== 'banking' || isPaymentPaid) return

    const interval = setInterval(async () => {
      try {
        const orderData = await apiRequest(`/orders/${createdOrder._id}`)
        if (orderData.trangThaiThanhToan === 'paid') {
          setIsPaymentPaid(true)
          clearInterval(interval)
        }
      } catch (err) {
        console.error("Lỗi khi kiểm tra trạng thái thanh toán:", err)
      }
    }, 4000) // Kiểm tra mỗi 4 giây

    return () => clearInterval(interval)
  }, [createdOrder, isPaymentPaid])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!cart) return

    setIsSubmitting(true)
    setError("")

    try {
      const response = await apiRequest("/orders", {
        method: "POST",
        body: JSON.stringify({
          diaChiGiaoHang,
          sdtNhanHang,
          ghiChu,
          phuongThucThanhToan,
          maGiamGia
        })
      })

      setCreatedOrder(response.order)
      // Xóa mã giảm giá sau khi dùng thành công
      localStorage.removeItem("appliedPromoCode")
      // Cập nhật lại số lượng giỏ hàng trong Navbar (giỏ hàng đã bị xóa sau khi đặt hàng thành công)
      window.dispatchEvent(new Event("cart-updated"))
    } catch (err: any) {
      setError(err.message || "Đặt hàng thất bại. Vui lòng thử lại.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Tính tổng tiền
  const subtotal = cart?.items.reduce((acc, item) => acc + item.product.gia * item.quantity, 0) || 0
  const discountPercent = maGiamGia === 'HUIT10' ? 10 : maGiamGia === 'HUIT20' ? 20 : 0
  const discountAmount = Math.round(subtotal * (discountPercent / 100))
  const total = subtotal - discountAmount

  if (isLoading) {
    return (
      <div className="container flex flex-col items-center justify-center py-32 gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-muted-foreground font-medium">Đang chuẩn bị trang thanh toán...</p>
      </div>
    )
  }

  // Màn hình hoàn thành đơn hàng
  if (createdOrder) {
    const isBanking = createdOrder.phuongThucThanhToan === 'banking'
    // Tạo link ảnh VietQR động: nội dung chuyển khoản phải chứa mã đơn hàng khớp RegExp: DH([a-fA-F0-9]{24})
    const vietQrUrl = `https://img.vietqr.io/image/${bankConfig.bankId}-${bankConfig.accountNo}-compact2.png?amount=${createdOrder.tongTien}&addInfo=DH${createdOrder._id}&accountName=${encodeURIComponent(bankConfig.accountName)}`

    return (
      <div className="container py-24 max-w-3xl">
        <div className="rounded-[2.5rem] border bg-card p-8 md:p-12 shadow-2xl space-y-8 text-center relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10" />

          {isBanking && !isPaymentPaid ? (
            <div className="space-y-6">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-500/10 text-blue-500">
                <QrCode className="h-8 w-8 animate-pulse" />
              </div>
              <div className="space-y-2">
                <h1 className="text-3xl font-extrabold tracking-tight">Thanh Toán Chuyển Khoản</h1>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Quét mã QR dưới đây hoặc chuyển khoản chính xác số tiền và nội dung để hệ thống tự động xác nhận đơn hàng của bạn.
                </p>
              </div>

              {/* Mã QR ngân hàng */}
              <div className="mx-auto max-w-xs p-4 border rounded-2xl bg-white shadow-md relative group">
                <div className="relative aspect-square w-full">
                  <img
                    src={vietQrUrl}
                    alt="VietQR Payment Code"
                    className="object-contain w-full h-full"
                  />
                </div>
                <div className="mt-2 text-xs font-black text-primary uppercase tracking-widest bg-primary/10 py-1.5 rounded-lg">
                  Nội dung chuyển khoản: DH{createdOrder._id}
                </div>
              </div>

              {/* Thông tin chuyển khoản bằng chữ */}
              <div className="rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 p-6 text-left space-y-3 max-w-md mx-auto border text-sm">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Ngân hàng</span>
                  <span className="font-bold">VietinBank (ICB)</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Số tài khoản</span>
                  <span className="font-bold select-all">{bankConfig.accountNo}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Chủ tài khoản</span>
                  <span className="font-bold uppercase">{bankConfig.accountName}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Số tiền</span>
                  <span className="font-extrabold text-primary">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(createdOrder.tongTien)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Nội dung ghi chú</span>
                  <span className="font-extrabold text-blue-600 bg-blue-100 dark:bg-blue-900/30 px-2 py-0.5 rounded select-all">
                    DH{createdOrder._id}
                  </span>
                </div>
              </div>

              {/* Loader đang chờ xác thực */}
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground font-medium animate-pulse">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                Đang chờ hệ thống ghi nhận giao dịch...
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button variant="outline" className="rounded-xl px-6 h-12" asChild>
                  <Link href="/products">Mua thêm sản phẩm khác</Link>
                </Button>
                <Button className="rounded-xl px-6 h-12 bg-primary" onClick={() => router.push("/")}>
                  Trang chủ
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-500/10 text-green-500">
                <CheckCircle2 className="h-12 w-12" />
              </div>
              <div className="space-y-2">
                <h1 className="text-4xl font-black tracking-tight">Đặt Hàng Thành Công!</h1>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Cảm ơn bạn đã mua hàng. Đơn hàng của bạn đã được ghi nhận và đang được xử lý.
                </p>
              </div>

              <div className="rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 p-6 text-left max-w-md mx-auto border text-sm space-y-2">
                <p><strong>Mã đơn hàng:</strong> {createdOrder._id}</p>
                <p><strong>Địa chỉ nhận hàng:</strong> {createdOrder.diaChiGiaoHang}</p>
                <p><strong>Số điện thoại:</strong> {createdOrder.sdtNhanHang}</p>
                <p><strong>Tổng thanh toán:</strong> {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(createdOrder.tongTien)}</p>
                <p><strong>Phương thức thanh toán:</strong> {createdOrder.phuongThucThanhToan === 'COD' ? 'Thanh toán khi nhận hàng (COD)' : 'Chuyển khoản Ngân hàng (Đã thanh toán)'}</p>
              </div>

              <div className="pt-6">
                <Button className="rounded-xl px-8 h-12" onClick={() => router.push("/")}>
                  Quay lại Trang Chủ
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="container py-12">
      <div className="mb-6">
        <Button asChild variant="ghost" className="gap-2">
          <Link href="/cart">
            <ArrowLeft className="h-4 w-4" /> Quay lại giỏ hàng
          </Link>
        </Button>
      </div>

      <h1 className="text-3xl font-extrabold tracking-tight mb-8">Thủ tục Thanh toán</h1>

      {error && (
        <div className="rounded-xl bg-destructive/10 p-4 text-sm font-medium text-destructive mb-6">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
        {/* Form điền thông tin thanh toán */}
        <div className="lg:col-span-7">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-xl font-bold border-b pb-2 flex items-center gap-2">
                <Truck className="h-5 w-5 text-primary" /> Thông tin nhận hàng
              </h2>

              <div className="space-y-2">
                <label htmlFor="hoTen" className="text-sm font-semibold">Họ và tên người nhận</label>
                <input
                  id="hoTen"
                  type="text"
                  value={hoTen}
                  onChange={(e) => setHoTen(e.target.value)}
                  placeholder="Nguyễn Văn A"
                  className="h-11 w-full rounded-xl border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="sdt" className="text-sm font-semibold">Số điện thoại nhận hàng</label>
                  <input
                    id="sdt"
                    type="tel"
                    value={sdtNhanHang}
                    onChange={(e) => setSdtNhanHang(e.target.value)}
                    placeholder="09XXXXXXXX"
                    className="h-11 w-full rounded-xl border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="diaChi" className="text-sm font-semibold">Địa chỉ giao hàng</label>
                  <input
                    id="diaChi"
                    type="text"
                    value={diaChiGiaoHang}
                    onChange={(e) => setDiaChiGiaoHang(e.target.value)}
                    placeholder="Số 140 Lê Trọng Tấn, P. Tây Thạnh, Q. Tân Phú"
                    className="h-11 w-full rounded-xl border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="ghiChu" className="text-sm font-semibold">Ghi chú đơn hàng (Tùy chọn)</label>
                <textarea
                  id="ghiChu"
                  value={ghiChu}
                  onChange={(e) => setGhiChu(e.target.value)}
                  placeholder="Ghi chú giao hàng (Ví dụ: Giao giờ hành chính, gọi điện trước khi giao...)"
                  className="min-h-24 w-full rounded-xl border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            {/* Chọn hình thức thanh toán */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold border-b pb-2 flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" /> Phương thức thanh toán
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Thanh toán COD */}
                <label className={`flex items-start gap-4 p-5 rounded-2xl border cursor-pointer transition-all hover:bg-zinc-50 dark:hover:bg-zinc-900/50 ${
                  phuongThucThanhToan === 'COD' ? 'border-primary ring-2 ring-primary/10' : ''
                }`}>
                  <input
                    type="radio"
                    name="phuongThucThanhToan"
                    value="COD"
                    checked={phuongThucThanhToan === 'COD'}
                    onChange={() => setPhuongThucThanhToan('COD')}
                    className="mt-1"
                  />
                  <div>
                    <span className="font-bold text-sm block">Thanh toán khi nhận hàng (COD)</span>
                    <span className="text-xs text-muted-foreground mt-1 block">Nhận hàng và thanh toán tiền mặt trực tiếp cho shipper.</span>
                  </div>
                </label>

                {/* Thanh toán ngân hàng */}
                <label className={`flex items-start gap-4 p-5 rounded-2xl border cursor-pointer transition-all hover:bg-zinc-50 dark:hover:bg-zinc-900/50 ${
                  phuongThucThanhToan === 'banking' ? 'border-primary ring-2 ring-primary/10' : ''
                }`}>
                  <input
                    type="radio"
                    name="phuongThucThanhToan"
                    value="banking"
                    checked={phuongThucThanhToan === 'banking'}
                    onChange={() => setPhuongThucThanhToan('banking')}
                    className="mt-1"
                  />
                  <div>
                    <span className="font-bold text-sm block">Chuyển khoản Ngân hàng (sePay)</span>
                    <span className="text-xs text-muted-foreground mt-1 block">Tạo mã QR quét nhanh qua ứng dụng ngân hàng để được duyệt đơn hàng tự động.</span>
                  </div>
                </label>
              </div>
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full rounded-2xl h-14 text-base font-bold shadow-lg">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Đang tạo đơn hàng...
                </>
              ) : (
                "Xác nhận đặt hàng"
              )}
            </Button>
          </form>
        </div>

        {/* Tóm tắt sản phẩm trong giỏ */}
        <div className="lg:col-span-5">
          <div className="rounded-[2rem] border bg-card p-6 shadow-sm sticky top-28 space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-primary" /> Sản phẩm đặt hàng ({cart?.items.length})
            </h2>

            <div className="divide-y max-h-96 overflow-y-auto pr-2 space-y-4">
              {cart?.items.map((item) => {
                if (!item.product) return null
                const itemImage = item.product.hinhAnh?.[0] || "https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=500&q=80"
                return (
                  <div key={item._id} className="flex gap-4 pt-4 first:pt-0">
                    <div className="relative h-16 w-16 overflow-hidden rounded-lg border bg-white flex items-center justify-center shrink-0">
                      <Image src={itemImage} alt={item.product.tenSP} fill className="object-contain p-1" />
                    </div>
                    <div className="flex-1 space-y-0.5 min-w-0">
                      <h4 className="font-bold text-sm line-clamp-2 leading-tight">{item.product.tenSP}</h4>
                      <p className="text-xs text-muted-foreground font-medium">Số lượng: {item.quantity}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-sm text-primary">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.product.gia * item.quantity)}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="border-t pt-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tạm tính</span>
                <span className="font-semibold">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(subtotal)}</span>
              </div>
              {discountPercent > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Mã giảm giá ({maGiamGia})</span>
                  <span>-{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Phí vận chuyển</span>
                <span className="font-semibold text-green-600">Miễn phí</span>
              </div>
              <div className="border-t pt-4 flex justify-between">
                <span className="text-base font-bold">Tổng thanh toán</span>
                <span className="text-xl font-black text-primary">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(total)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
