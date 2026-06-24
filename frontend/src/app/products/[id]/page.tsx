"use client"

import { use, useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Loader2,
  MessageCircle,
  RotateCcw,
  Send,
  ShieldCheck,
  ShoppingCart,
  Star,
  Truck,
} from "lucide-react"
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

interface Discussion {
  _id: string
  user: {
    _id: string
    hoTen: string
  }
  content: string
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

type FeedbackTab = "reviews" | "discussion"

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback
}

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { id } = use(params)

  const [product, setProduct] = useState<Product | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [discussions, setDiscussions] = useState<Discussion[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [activeFeedbackTab, setActiveFeedbackTab] = useState<FeedbackTab>("reviews")

  const [quantity, setQuantity] = useState(1)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [cartSuccess, setCartSuccess] = useState(false)

  const [newRating, setNewRating] = useState(5)
  const [newComment, setNewComment] = useState("")
  const [isSubmittingReview, setIsSubmittingReview] = useState(false)
  const [reviewError, setReviewError] = useState("")
  const [reviewSuccess, setReviewSuccess] = useState("")

  const [discussionContent, setDiscussionContent] = useState("")
  const [isSubmittingDiscussion, setIsSubmittingDiscussion] = useState(false)
  const [discussionError, setDiscussionError] = useState("")
  const [discussionSuccess, setDiscussionSuccess] = useState("")

  const fetchData = async () => {
    setIsLoading(true)
    setError("")

    try {
      const productData = await apiRequest(`/products/${id}`)
      setProduct(productData)

      try {
        const reviewsData = await apiRequest(`/reviews/${id}`)
        setReviews(reviewsData)
      } catch (reviewError) {
        console.error("Failed to load reviews:", reviewError)
      }

      try {
        const discussionsData = await apiRequest(`/discussions/${id}`)
        setDiscussions(discussionsData)
      } catch (discussionError) {
        console.error("Failed to load discussions:", discussionError)
      }
    } catch (err) {
      setError(getErrorMessage(err, "Unable to load product details."))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [id])

  const handleQuantityChange = (value: number) => {
    if (!product) return

    const nextQuantity = quantity + value
    if (nextQuantity >= 1 && nextQuantity <= product.soLuong) {
      setQuantity(nextQuantity)
    }
  }

  const requireLogin = () => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/auth/login")
      return false
    }
    return true
  }

  const handleAddToCart = async () => {
    if (!product || !requireLogin()) return

    setIsAddingToCart(true)
    setCartSuccess(false)

    try {
      await apiRequest("/cart", {
        method: "POST",
        body: JSON.stringify({
          productId: product._id,
          quantity,
        }),
      })
      setCartSuccess(true)
      setTimeout(() => setCartSuccess(false), 3000)
    } catch (err) {
      alert(getErrorMessage(err, "Unable to add this product to your cart."))
    } finally {
      setIsAddingToCart(false)
    }
  }

  const handleBuyNow = async () => {
    if (!product || !requireLogin()) return

    try {
      await apiRequest("/cart", {
        method: "POST",
        body: JSON.stringify({
          productId: product._id,
          quantity,
        }),
      })
      router.push("/cart")
    } catch (err) {
      alert(getErrorMessage(err, "Unable to start checkout."))
    }
  }

  const handleSubmitReview = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!requireLogin()) return

    setIsSubmittingReview(true)
    setReviewError("")
    setReviewSuccess("")

    try {
      await apiRequest("/reviews", {
        method: "POST",
        body: JSON.stringify({
          productId: id,
          rating: newRating,
          comment: newComment,
        }),
      })
      setReviewSuccess("Your review has been submitted.")
      setNewComment("")
      await fetchData()
    } catch (err) {
      setReviewError(getErrorMessage(err, "Only customers with a delivered order can review this product."))
    } finally {
      setIsSubmittingReview(false)
    }
  }

  const handleSubmitDiscussion = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!requireLogin()) return

    setIsSubmittingDiscussion(true)
    setDiscussionError("")
    setDiscussionSuccess("")

    try {
      const data = await apiRequest("/discussions", {
        method: "POST",
        body: JSON.stringify({
          productId: id,
          content: discussionContent,
        }),
      })
      setDiscussions((current) => [data.discussion, ...current])
      setDiscussionContent("")
      setDiscussionSuccess("Your discussion post has been published.")
    } catch (err) {
      setDiscussionError(getErrorMessage(err, "Unable to publish your discussion post."))
    } finally {
      setIsSubmittingDiscussion(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="font-medium text-muted-foreground">Loading product details...</p>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="container py-24 text-center">
        <div className="mx-auto max-w-md space-y-4 rounded-lg border border-destructive/20 bg-destructive/5 p-8">
          <p className="font-medium text-destructive">{error || "Product not found."}</p>
          <Button asChild variant="outline">
            <Link href="/products" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" /> Back to products
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  const mainImage = product.hinhAnh?.[0] || "https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=800&q=80"
  const averageRating = product.danhGiaTB?.toFixed(1) || "5.0"

  return (
    <div className="container py-10">
      <div className="mb-6">
        <Button asChild variant="ghost" className="gap-2">
          <Link href="/products">
            <ArrowLeft className="h-4 w-4" /> Back to products
          </Link>
        </Button>
      </div>

      <section className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="relative aspect-square overflow-hidden rounded-lg border bg-white shadow-sm">
            <Image
              src={mainImage}
              alt={product.tenSP}
              fill
              className="object-contain p-6"
              priority
            />
          </div>

          {product.hinhAnh && product.hinhAnh.length > 1 && (
            <div className="grid grid-cols-4 gap-3">
              {product.hinhAnh.map((image, index) => (
                <div key={image} className="relative aspect-square overflow-hidden rounded-lg border bg-white">
                  <Image
                    src={image}
                    alt={`${product.tenSP} ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-7">
          <div className="space-y-3">
            {product.loai && (
              <p className="text-xs font-black uppercase tracking-[0.22em] text-primary">{product.loai.tenDM}</p>
            )}
            <h1 className="text-4xl font-black tracking-tight text-foreground md:text-5xl">{product.tenSP}</h1>
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <span className="inline-flex items-center gap-1 rounded-lg border bg-background px-3 py-1 font-bold">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                {averageRating}
              </span>
              <span className="text-muted-foreground">{product.tongDanhGia || 0} reviews</span>
              {product.soLuong > 0 ? (
                <span className="rounded-lg bg-emerald-500/10 px-3 py-1 font-medium text-emerald-600">
                  In stock: {product.soLuong}
                </span>
              ) : (
                <span className="rounded-lg bg-destructive/10 px-3 py-1 font-medium text-destructive">
                  Out of stock
                </span>
              )}
            </div>
          </div>

          <p className="text-3xl font-black text-primary">
            {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(product.gia)}
          </p>

          <div className="space-y-2 border-y py-5">
            <h2 className="text-lg font-bold">Product details</h2>
            <p className="whitespace-pre-line leading-relaxed text-muted-foreground">{product.moTa}</p>
          </div>

          {product.soLuong > 0 && (
            <div className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="flex h-12 w-full items-center justify-between rounded-lg border bg-background px-4 sm:w-36">
                  <button onClick={() => handleQuantityChange(-1)} className="px-2 text-xl font-bold hover:text-primary">
                    -
                  </button>
                  <span className="font-bold">{quantity}</span>
                  <button onClick={() => handleQuantityChange(1)} className="px-2 text-xl font-bold hover:text-primary">
                    +
                  </button>
                </div>

                <Button onClick={handleAddToCart} disabled={isAddingToCart} className="h-12 flex-1 gap-2 rounded-lg">
                  {isAddingToCart ? <Loader2 className="h-5 w-5 animate-spin" /> : <ShoppingCart className="h-5 w-5" />}
                  Add to cart
                </Button>
              </div>

              {cartSuccess && (
                <div className="rounded-lg bg-emerald-500/10 p-3 text-center text-sm font-bold text-emerald-600">
                  Product added to cart.
                </div>
              )}

              <Button
                size="lg"
                variant="outline"
                onClick={handleBuyNow}
                className="h-12 w-full rounded-lg border-primary font-bold text-primary hover:bg-primary/5"
              >
                Buy now
              </Button>
            </div>
          )}

          <div className="grid grid-cols-1 gap-3 border-t pt-6 sm:grid-cols-3">
            {[
              { icon: Truck, title: "Free shipping", text: "Orders over 500k" },
              { icon: RotateCcw, title: "30-day returns", text: "For manufacturer defects" },
              { icon: ShieldCheck, title: "12-month warranty", text: "Official products" },
            ].map((item) => (
              <div key={item.title} className="rounded-lg border bg-card p-4">
                <item.icon className="mb-3 h-5 w-5 text-primary" />
                <p className="font-bold">{item.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-16 border-t pt-10">
        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-primary">Customer feedback</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight md:text-4xl">Reviews and discussion</h2>
          </div>

          <div className="grid grid-cols-2 rounded-lg border bg-muted/30 p-1">
            <button
              type="button"
              onClick={() => setActiveFeedbackTab("reviews")}
              className={`inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-bold transition ${
                activeFeedbackTab === "reviews" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              <Star className="h-4 w-4" />
              Reviews
            </button>
            <button
              type="button"
              onClick={() => setActiveFeedbackTab("discussion")}
              className={`inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-bold transition ${
                activeFeedbackTab === "discussion" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              <MessageCircle className="h-4 w-4" />
              Discussion
            </button>
          </div>
        </div>

        {activeFeedbackTab === "reviews" ? (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="rounded-lg border bg-card p-6 shadow-sm">
              <h3 className="text-xl font-bold">Write a review</h3>
              <p className="mt-2 text-sm text-muted-foreground">Reviews are accepted after a delivered order.</p>

              {reviewError && (
                <div className="mt-4 rounded-lg bg-destructive/10 p-3 text-sm font-medium text-destructive">
                  {reviewError}
                </div>
              )}
              {reviewSuccess && (
                <div className="mt-4 rounded-lg bg-emerald-500/10 p-3 text-sm font-medium text-emerald-600">
                  {reviewSuccess}
                </div>
              )}

              <form onSubmit={handleSubmitReview} className="mt-5 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold">Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewRating(star)}
                        className="transition hover:scale-110"
                      >
                        <Star className={`h-7 w-7 ${star <= newRating ? "fill-yellow-400 text-yellow-400" : "text-zinc-300"}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="review-comment" className="text-sm font-bold">Review</label>
                  <textarea
                    id="review-comment"
                    value={newComment}
                    onChange={(event) => setNewComment(event.target.value)}
                    placeholder="Share your experience with this product..."
                    className="min-h-32 w-full rounded-lg border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    required
                  />
                </div>

                <Button type="submit" disabled={isSubmittingReview} className="w-full gap-2 rounded-lg">
                  {isSubmittingReview ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Submit review
                </Button>
              </form>
            </div>

            <div className="lg:col-span-2">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-xl font-bold">Customer reviews</h3>
                <span className="rounded-lg border px-3 py-1 text-sm font-bold">{reviews.length}</span>
              </div>

              {reviews.length === 0 ? (
                <div className="rounded-lg border border-dashed p-10 text-center text-muted-foreground">
                  No reviews yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <article key={review._id} className="rounded-lg border bg-card p-5 shadow-sm">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                            {review.user?.hoTen?.charAt(0).toUpperCase() || "U"}
                          </div>
                          <div>
                            <p className="font-bold">{review.user?.hoTen || "HUIT customer"}</p>
                            <p className="text-xs text-muted-foreground">{new Date(review.createdAt).toLocaleDateString("en-US")}</p>
                          </div>
                        </div>
                        <div className="flex text-yellow-500">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star key={star} className={`h-4 w-4 ${star <= review.rating ? "fill-yellow-400 text-yellow-400" : "text-zinc-200"}`} />
                          ))}
                        </div>
                      </div>
                      <p className="mt-4 rounded-lg bg-muted/40 p-4 text-sm leading-relaxed text-muted-foreground">{review.comment}</p>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="rounded-lg border bg-card p-6 shadow-sm">
              <h3 className="text-xl font-bold">Start a discussion</h3>
              <p className="mt-2 text-sm text-muted-foreground">Ask questions or share product tips with other shoppers.</p>

              {discussionError && (
                <div className="mt-4 rounded-lg bg-destructive/10 p-3 text-sm font-medium text-destructive">
                  {discussionError}
                </div>
              )}
              {discussionSuccess && (
                <div className="mt-4 rounded-lg bg-emerald-500/10 p-3 text-sm font-medium text-emerald-600">
                  {discussionSuccess}
                </div>
              )}

              <form onSubmit={handleSubmitDiscussion} className="mt-5 space-y-4">
                <textarea
                  value={discussionContent}
                  onChange={(event) => setDiscussionContent(event.target.value)}
                  placeholder="Write a question or comment..."
                  className="min-h-32 w-full rounded-lg border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  required
                />
                <Button type="submit" disabled={isSubmittingDiscussion} className="w-full gap-2 rounded-lg">
                  {isSubmittingDiscussion ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Post discussion
                </Button>
              </form>
            </div>

            <div className="lg:col-span-2">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-xl font-bold">Discussion</h3>
                <span className="rounded-lg border px-3 py-1 text-sm font-bold">{discussions.length}</span>
              </div>

              {discussions.length === 0 ? (
                <div className="rounded-lg border border-dashed p-10 text-center text-muted-foreground">
                  No discussion posts yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {discussions.map((discussion) => (
                    <article key={discussion._id} className="rounded-lg border bg-card p-5 shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                          {discussion.user?.hoTen?.charAt(0).toUpperCase() || "U"}
                        </div>
                        <div>
                          <p className="font-bold">{discussion.user?.hoTen || "HUIT customer"}</p>
                          <p className="text-xs text-muted-foreground">{new Date(discussion.createdAt).toLocaleDateString("en-US")}</p>
                        </div>
                      </div>
                      <p className="mt-4 rounded-lg bg-muted/40 p-4 text-sm leading-relaxed text-muted-foreground">{discussion.content}</p>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
