"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Trash2, ShoppingBag, ArrowLeft, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { apiRequest } from "@/lib/api-client"

interface CartProduct {
  _id: string
  tenSP: string
  gia: number
  hinhAnh: string[]
}

interface CartItem {
  product: CartProduct
  quantity: number
  _id: string
}

interface Cart {
  _id: string
  user: string
  items: CartItem[]
}

export default function CartPage() {
  const router = useRouter()
  const [cart, setCart] = useState<Cart | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  const [promoCode, setPromoCode] = useState("")
  const [appliedCode, setAppliedCode] = useState("")
  const [discountPercent, setDiscountPercent] = useState(0)
  const [promoError, setPromoError] = useState("")
  const [promoSuccess, setPromoSuccess] = useState("")

  const handleApplyPromo = () => {
    setPromoError("")
    setPromoSuccess("")
    const code = promoCode.trim().toUpperCase()
    
    if (code === 'HUIT10') {
      setDiscountPercent(10)
      setAppliedCode(code)
      setPromoSuccess("Áp dụng mã HUIT10 giảm 10% thành công!")
    } else if (code === 'HUIT20') {
      setDiscountPercent(20)
      setAppliedCode(code)
      setPromoSuccess("Áp dụng mã HUIT20 giảm 20% thành công!")
    } else {
      setPromoError("Mã giảm giá không hợp lệ!")
      setDiscountPercent(0)
      setAppliedCode("")
    }
  }

  const handleCheckout = () => {
    if (appliedCode) {
      localStorage.setItem("appliedPromoCode", appliedCode)
    } else {
      localStorage.removeItem("appliedPromoCode")
    }
    router.push("/checkout")
  }

  const fetchCart = async () => {
    const token = localStorage.getItem("token")
    if (!token) {
      setError("Vui lòng đăng nhập để xem giỏ hàng của bạn.")
      setIsLoading(false)
      return
    }

    try {
      const data = await apiRequest("/cart")
      setCart(data)
      setError("")
    } catch (err: any) {
      setError(err.message || "Không thể lấy thông tin giỏ hàng.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCart()
  }, [])

  // Cập nhật số lượng sản phẩm trong giỏ hàng
  const handleUpdateQuantity = async (productId: string, currentQty: number, change: number) => {
    const newQty = currentQty + change
    if (newQty < 1) return

    try {
      const updatedCart = await apiRequest("/cart", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity: newQty })
      })
      setCart(updatedCart)
      // Thông báo cho Navbar biết giỏ hàng đã thay đổi
      window.dispatchEvent(new Event("cart-updated"))
    } catch (err: any) {
      alert(err.message || "Lỗi cập nhật số lượng.")
    }
  }

  // Xóa sản phẩm khỏi giỏ hàng
  const handleRemoveItem = async (productId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng?")) return

    try {
      const updatedCart = await apiRequest(`/cart/${productId}`, {
        method: "DELETE"
      })
      setCart(updatedCart)
      window.dispatchEvent(new Event("cart-updated"))
    } catch (err: any) {
      alert(err.message || "Lỗi khi xóa sản phẩm.")
    }
  }

  // Tính tổng tiền hàng
  const subtotal = cart?.items.reduce((acc, item) => {
    if (item.product) {
      return acc + item.product.gia * item.quantity
    }
    return acc
  }, 0) || 0

  const discountAmount = Math.round(subtotal * (discountPercent / 100))
  const shipping = 0
  const total = subtotal - discountAmount + shipping

  if (isLoading) {
    return (
      <div className="container flex flex-col items-center justify-center py-32 gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-muted-foreground font-medium">Đang tải giỏ hàng...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container flex flex-col items-center justify-center py-32 text-center gap-6">
        <div className="rounded-full bg-muted p-6">
          <ShoppingBag className="h-12 w-12 text-muted-foreground" />
        </div>
        <h1 className="text-3xl font-bold">Giỏ hàng của bạn</h1>
        <p className="max-w-md text-muted-foreground">{error}</p>
        <Button asChild size="lg" className="rounded-full px-8">
          <Link href="/auth/login">Đăng nhập ngay</Link>
        </Button>
      </div>
    )
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container flex flex-col items-center justify-center py-32 text-center gap-6">
        <div className="rounded-full bg-muted p-6">
          <ShoppingBag className="h-12 w-12 text-muted-foreground" />
        </div>
        <h1 className="text-3xl font-bold">Giỏ hàng của bạn đang trống</h1>
        <p className="max-w-md text-muted-foreground">
          Có vẻ như bạn chưa thêm sản phẩm nào vào giỏ hàng. Hãy khám phá những sản phẩm công nghệ tuyệt vời của chúng tôi!
        </p>
        <Button asChild size="lg" className="rounded-full px-8">
          <Link href="/products">Tiếp tục mua sắm</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="container py-12">
      <h1 className="text-3xl font-bold tracking-tight mb-8">Giỏ hàng của bạn</h1>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
        {/* Danh sách sản phẩm trong giỏ hàng */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border bg-card">
            {cart.items.map((item, index) => {
              if (!item.product) return null
              const itemImage = item.product.hinhAnh?.[0] || "https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=500&q=80"
              return (
                <div key={item._id} className={`flex items-center gap-4 p-6 ${index !== cart.items.length - 1 ? 'border-b' : ''}`}>
                  <div className="relative h-24 w-24 overflow-hidden rounded-lg border bg-white flex items-center justify-center shrink-0">
                    <Image src={itemImage} alt={item.product.tenSP} fill className="object-contain p-2" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <h3 className="font-bold hover:text-primary transition-colors text-base line-clamp-2">
                      <Link href={`/products/${item.product._id}`}>{item.product.tenSP}</Link>
                    </h3>
                    <p className="text-sm text-primary font-semibold">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.product.gia)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 items-center rounded-md border px-2 bg-background">
                      <button onClick={() => handleUpdateQuantity(item.product._id, item.quantity, -1)} className="px-2 font-bold hover:text-primary transition-colors">-</button>
                      <span className="mx-2 text-sm font-bold w-4 text-center">{item.quantity}</span>
                      <button onClick={() => handleUpdateQuantity(item.product._id, item.quantity, 1)} className="px-2 font-bold hover:text-primary transition-colors">+</button>
                    </div>
                    <Button onClick={() => handleRemoveItem(item.product._id)} variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10">
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Xóa</span>
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>

          <Button variant="ghost" asChild className="gap-2">
            <Link href="/products">
              <ArrowLeft className="h-4 w-4" /> Tiếp tục mua sắm
            </Link>
          </Button>
        </div>

        {/* Tóm tắt đơn hàng */}
        <div className="space-y-6">
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <h2 className="text-xl font-bold mb-6">Tóm tắt đơn hàng</h2>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tạm tính</span>
                <span className="font-medium">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(subtotal)}</span>
              </div>
              {discountPercent > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Giảm giá ({discountPercent}%)</span>
                  <span>-{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Phí vận chuyển</span>
                <span className="font-medium text-green-600">Miễn phí</span>
              </div>
              <div className="border-t pt-4 flex justify-between">
                <span className="text-lg font-bold">Tổng cộng</span>
                <span className="text-lg font-bold text-primary">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(total)}
                </span>
              </div>
            </div>
            <Button onClick={handleCheckout} size="lg" className="w-full mt-8 rounded-xl font-bold">
              Thực hiện thanh toán
            </Button>
          </div>

          <div className="rounded-xl border border-dashed p-6 space-y-3">
            <p className="text-sm font-medium">Mã giảm giá</p>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Nhập mã (HUIT10, HUIT20)..."
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                className="flex-1 rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring uppercase"
              />
              <Button onClick={handleApplyPromo} variant="secondary" size="sm">Áp dụng</Button>
            </div>
            {promoError && <p className="text-xs text-destructive font-semibold">{promoError}</p>}
            {promoSuccess && <p className="text-xs text-green-600 font-semibold">{promoSuccess}</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
