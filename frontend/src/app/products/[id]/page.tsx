"use client"

import { use, useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Star, ShoppingCart, ShieldCheck, Truck, RotateCcw, Loader2, ArrowLeft, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { apiRequest } from "@/lib/api-client"

interface Review {
  _id: string
  user: {
    _id: string
    hoTen: string
  }
  rating: number
  comment: string
  createdAt: string
}

interface Product {
  _id: string
  tenSP: string
  moTa: string
  gia: number
  soLuong: number
  hinhAnh: string[]
  loai?: {
    _id: string
    tenDM: string
  }
  danhGiaTB: number
  tongDanhGia: number
}

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { id } = use(params)

  const [product, setProduct] = useState<Product | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  
  // State mua hàng
  const [quantity, setQuantity] = useState(1)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [cartSuccess, setCartSuccess] = useState(false)

  // State gửi đánh giá
  const [newRating, setNewRating] = useState(5)
  const [newComment, setNewComment] = useState("")
  const [isSubmittingReview, setIsSubmittingReview] = useState(false)
  const [reviewError, setReviewError] = useState("")
  const [reviewSuccess, setReviewSuccess] = useState("")

  const fetchData = async () => {
    setIsLoading(true)
    setError("")
    try {
      // 1. Fetch chi tiết sản phẩm
      const productData = await apiRequest(`/products/${id}`)
      setProduct(productData)

      // 2. Fetch danh sách đánh giá
      try {
        const reviewsData = await apiRequest(`/reviews/${id}`)
        setReviews(reviewsData)
      } catch (err) {
        console.error("Lỗi lấy danh sách đánh giá:", err)
      }
    } catch (err: any) {
      setError(err.message || "Không thể tải thông tin sản phẩm.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [id])

  const handleQuantityChange = (val: number) => {
    if (!product) return
    const newQty = quantity + val
    if (newQty >= 1 && newQty <= product.soLuong) {
      setQuantity(newQty)
    }
  }

  const handleAddToCart = async () => {
    if (!product) return
    
    // Kiểm tra đăng nhập sơ bộ
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/auth/login")
      return
    }

    setIsAddingToCart(true)
    setCartSuccess(false)
    try {
      await apiRequest("/cart", {
        method: "POST",
        body: JSON.stringify({
          productId: product._id,
          quantity: quantity
        })
      })
      setCartSuccess(true)
      // Tự động tắt thông báo sau 3 giây
      setTimeout(() => setCartSuccess(false), 3000)
    } catch (err: any) {
      alert(err.message || "Không thể thêm sản phẩm vào giỏ hàng.")
    } finally {
      setIsAddingToCart(false)
    }
  }

  const handleBuyNow = async () => {
    if (!product) return
    
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/auth/login")
      return
    }

    try {
      await apiRequest("/cart", {
        method: "POST",
        body: JSON.stringify({
          productId: product._id,
          quantity: quantity
        })
      })
      router.push("/cart")
    } catch (err: any) {
      alert(err.message || "Đã xảy ra lỗi khi mua ngay.")
    }
  }

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    const token = localStorage.getItem("token")
    if (!token) {
      setReviewError("Vui lòng đăng nhập để gửi đánh giá.")
      return
    }

    setIsSubmittingReview(true)
    setReviewError("")
    setReviewSuccess("")

    try {
      await apiRequest("/reviews", {
        method: "POST",
        body: JSON.stringify({
          productId: id,
          rating: newRating,
          comment: newComment
        })
      })
      setReviewSuccess("Gửi đánh giá thành công! Cảm ơn ý kiến của bạn.")
      setNewComment("")
      // Load lại dữ liệu để cập nhật danh sách đánh giá và số sao trung bình
      fetchData()
    } catch (err: any) {
      setReviewError(err.message || "Không thể gửi đánh giá. Vui lòng kiểm tra lại đơn hàng của bạn.")
    } finally {
      setIsSubmittingReview(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container flex flex-col items-center justify-center py-32 gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-muted-foreground font-medium">Đang tải thông tin sản phẩm...</p>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="container py-24 text-center space-y-6">
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-8 max-w-md mx-auto space-y-4">
          <p className="text-destructive font-medium">{error || "Không tìm thấy sản phẩm."}</p>
          <Button asChild variant="outline">
            <Link href="/products" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" /> Quay lại danh sách sản phẩm
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  // Lấy ảnh hiển thị chính (nếu mảng hinhAnh trống thì dùng ảnh mặc định)
  const mainImage = product.hinhAnh?.[0] || "https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=800&q=80"

  return (
    <div className="container py-12">
      {/* Nút quay lại */}
      <div className="mb-6">
        <Button asChild variant="ghost" className="gap-2">
          <Link href="/products">
            <ArrowLeft className="h-4 w-4" /> Quay lại
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        {/* Khối hình ảnh */}
        <div className="space-y-4">
          <div className="relative aspect-square overflow-hidden rounded-2xl border bg-white flex items-center justify-center">
            <Image
              src={mainImage}
              alt={product.tenSP}
              fill
              className="object-contain p-4"
              priority
            />
          </div>
          {product.hinhAnh && product.hinhAnh.length > 1 && (
            <div className="grid grid-cols-4 gap-4">
              {product.hinhAnh.map((img, i) => (
                <div key={i} className="relative aspect-square overflow-hidden rounded-lg border bg-white cursor-pointer hover:border-primary">
                  <Image
                    src={img}
                    alt={`${product.tenSP} ${i}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Khối thông tin sản phẩm */}
        <div className="space-y-6">
          <div className="space-y-2">
            {product.loai && (
              <p className="text-sm font-black text-primary uppercase tracking-wider">{product.loai.tenDM}</p>
            )}
            <h1 className="text-4xl font-bold tracking-tight">{product.tenSP}</h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center text-yellow-500">
                <Star className="h-4 w-4 fill-current" />
                <span className="ml-1 text-sm font-bold text-foreground">{product.danhGiaTB?.toFixed(1) || "5.0"}</span>
              </div>
              <span className="text-sm text-muted-foreground">({product.tongDanhGia || 0} đánh giá)</span>
              {product.soLuong > 0 ? (
                <span className="text-sm text-green-600 font-medium">Còn hàng: {product.soLuong} sản phẩm</span>
              ) : (
                <span className="text-sm text-destructive font-medium">Hết hàng</span>
              )}
            </div>
          </div>

          <p className="text-3xl font-black text-primary">
            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.gia)}
          </p>

          <div className="border-t pt-4">
            <h3 className="font-bold mb-2">Mô tả sản phẩm</h3>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
              {product.moTa}
            </p>
          </div>

          {product.soLuong > 0 && (
            <div className="space-y-4 pt-4 border-t">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex h-12 items-center rounded-lg border px-4 bg-background">
                  <button onClick={() => handleQuantityChange(-1)} className="text-xl font-bold px-2 hover:text-primary transition-colors">-</button>
                  <span className="mx-6 font-bold w-4 text-center">{quantity}</span>
                  <button onClick={() => handleQuantityChange(1)} className="text-xl font-bold px-2 hover:text-primary transition-colors">+</button>
                </div>
                
                <Button 
                  size="lg" 
                  onClick={handleAddToCart}
                  disabled={isAddingToCart}
                  className="flex-1 gap-2 rounded-lg h-12"
                >
                  {isAddingToCart ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <ShoppingCart className="h-5 w-5" />
                  )}
                  Thêm vào giỏ hàng
                </Button>
              </div>

              {cartSuccess && (
                <div className="text-sm text-green-600 font-bold text-center bg-green-500/10 p-2 rounded-lg">
                  ✓ Đã thêm sản phẩm vào giỏ hàng thành công!
                </div>
              )}

              <Button 
                size="lg" 
                variant="outline" 
                onClick={handleBuyNow}
                className="w-full rounded-lg h-12 border-primary text-primary hover:bg-primary/5 font-bold"
              >
                Mua ngay
              </Button>
            </div>
          )}

          {/* Cam kết bán hàng */}
          <div className="grid grid-cols-1 gap-4 border-t pt-8 sm:grid-cols-3 text-xs">
            <div className="flex items-start gap-3">
              <Truck className="h-5 w-5 text-primary shrink-0" />
              <div>
                <p className="font-bold">Giao hàng miễn phí</p>
                <p className="text-muted-foreground">Cho các đơn hàng từ 500k</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <RotateCcw className="h-5 w-5 text-primary shrink-0" />
              <div>
                <p className="font-bold">Đổi trả 30 ngày</p>
                <p className="text-muted-foreground">Nếu có lỗi từ nhà sản xuất</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <ShieldCheck className="h-5 w-5 text-primary shrink-0" />
              <div>
                <p className="font-bold">Bảo hành 12 tháng</p>
                <p className="text-muted-foreground">Chính hãng 100%</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Phần Đánh Giá & Nhận Xét */}
      <div className="mt-16 border-t pt-12">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
          
          {/* Form gửi đánh giá mới */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Viết Đánh Giá Của Bạn</h2>
            
            {reviewError && (
              <div className="rounded-lg bg-destructive/10 p-3 text-sm font-medium text-destructive">
                {reviewError}
              </div>
            )}
            
            {reviewSuccess && (
              <div className="rounded-lg bg-green-500/10 p-3 text-sm font-medium text-green-600">
                {reviewSuccess}
              </div>
            )}

            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold">Số sao đánh giá</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewRating(star)}
                      className="text-2xl transition-transform hover:scale-110"
                    >
                      <Star
                        className={`h-7 w-7 ${
                          star <= newRating ? "fill-yellow-400 text-yellow-400" : "text-zinc-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="comment" className="text-sm font-bold">Nội dung nhận xét</label>
                <textarea
                  id="comment"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Chia sẻ ý kiến của bạn về sản phẩm..."
                  className="min-h-32 w-full rounded-xl border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  required
                />
              </div>

              <Button type="submit" disabled={isSubmittingReview} className="w-full gap-2 rounded-xl">
                {isSubmittingReview ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                Gửi nhận xét
              </Button>
            </form>
          </div>

          {/* Danh sách các đánh giá từ khách hàng */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-2xl font-bold">Khách Hàng Nhận Xét ({reviews.length})</h2>
            
            {reviews.length === 0 ? (
              <div className="rounded-xl border border-dashed py-12 text-center text-muted-foreground">
                Chưa có đánh giá nào cho sản phẩm này. Hãy là người đầu tiên trải nghiệm và chia sẻ!
              </div>
            ) : (
              <div className="space-y-6 divide-y">
                {reviews.map((rev) => (
                  <div key={rev._id} className="pt-6 first:pt-0 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-sm">
                          {rev.user?.hoTen?.charAt(0).toUpperCase() || "U"}
                        </div>
                        <div>
                          <p className="font-bold text-sm">{rev.user?.hoTen || "Người dùng HUIT"}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(rev.createdAt).toLocaleDateString('vi-VN')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center text-yellow-500">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${
                              star <= rev.rating ? "fill-yellow-400 text-yellow-400" : "text-zinc-200"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm leading-relaxed text-zinc-600 bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-xl">
                      {rev.comment}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
