"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Loader2, Sparkles, Flame, Clock, Award, Percent } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProductCard } from "@/components/shared/product-card"
import { apiRequest } from "@/lib/api-client"

interface Product {
  _id: string
  tenSP: string
  moTa: string
  gia: number
  giaCu?: number
  hinhAnh: string[]
  loai?: {
    _id: string
    tenDM: string
  }
  danhGiaTB: number
}

export default function DealsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState("all")

  // Countdown timer cho Flash Sale (Giả lập còn 12 giờ)
  const [timeLeft, setTimeLeft] = useState({ hours: 11, minutes: 45, seconds: 30 })

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 }
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 }
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 }
        } else {
          return { hours: 23, minutes: 59, seconds: 59 } // Reset
        }
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const fetchDeals = async () => {
      setIsLoading(true)
      try {
        const data = await apiRequest("/products?isDeal=true")
        setProducts(data)
      } catch (err: any) {
        setError(err.message || "Không thể lấy thông tin khuyến mãi.")
      } finally {
        setIsLoading(false)
      }
    }
    fetchDeals()
  }, [])

  const categories = ["all", ...Array.from(new Set(products.map(p => p.loai?.tenDM).filter((x): x is string => !!x)))]

  const filteredProducts = activeTab === "all"
    ? products
    : products.filter(p => p.loai?.tenDM === activeTab)

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" as any }
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-24 overflow-hidden relative">
      {/* Background decoration blobs */}
      <div className="absolute top-[10%] left-[-15%] w-[45%] h-[40%] bg-red-500/10 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute bottom-[20%] right-[-15%] w-[45%] h-[40%] bg-orange-500/10 rounded-full blur-[140px] pointer-events-none -z-10" />

      {/* Hero Banner Section */}
      <section className="container pt-12">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative rounded-[3rem] overflow-hidden border border-zinc-800 bg-gradient-to-br from-zinc-900 via-zinc-900/60 to-zinc-950 p-8 md:p-16 shadow-2xl"
        >
          {/* Animated red line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500" />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-red-500 font-black text-xs uppercase tracking-[0.25em]">
                <Flame className="h-5 w-5 fill-current animate-pulse" />
                <span>Super Flash Sale</span>
              </div>
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tighter leading-tight">
                MIDYEAR <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400">MEGA DEALS</span>
              </h1>
              <p className="text-zinc-400 font-medium text-lg max-w-md leading-relaxed">
                Cơ hội sở hữu các thiết bị công nghệ đỉnh cao với mức giảm giá chưa từng có. Cam kết chính hãng 100%.
              </p>

              {/* Promo Banner Benefit Tags */}
              <div className="flex flex-wrap gap-4 pt-2">
                <div className="flex items-center gap-2 bg-zinc-800/50 px-4 py-2 rounded-xl text-xs font-bold border border-zinc-800">
                  <Percent className="h-4 w-4 text-red-400" /> Free Shipping
                </div>
                <div className="flex items-center gap-2 bg-zinc-800/50 px-4 py-2 rounded-xl text-xs font-bold border border-zinc-800">
                  <Award className="h-4 w-4 text-orange-400" /> Bảo hành 1-đổi-1
                </div>
              </div>
            </div>

            {/* Timer card block */}
            <div className="flex flex-col items-center lg:items-end justify-center">
              <div className="bg-zinc-900/80 border border-zinc-800 rounded-[2.5rem] p-8 md:p-10 shadow-xl backdrop-blur-md w-full max-w-md space-y-6">
                <div className="flex items-center gap-2 text-zinc-300 font-bold justify-center">
                  <Clock className="h-5 w-5 text-red-500" />
                  <span>KẾT THÚC SAU</span>
                </div>
                
                <div className="flex justify-center gap-4">
                  <div className="flex flex-col items-center">
                    <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-20 h-20 flex items-center justify-center shadow-inner">
                      <span className="text-4xl font-black text-red-500 tracking-tight">{String(timeLeft.hours).padStart(2, '0')}</span>
                    </div>
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mt-2">Giờ</span>
                  </div>
                  <div className="text-4xl font-black text-zinc-700 self-center -translate-y-3">:</div>
                  <div className="flex flex-col items-center">
                    <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-20 h-20 flex items-center justify-center shadow-inner">
                      <span className="text-4xl font-black text-red-500 tracking-tight">{String(timeLeft.minutes).padStart(2, '0')}</span>
                    </div>
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mt-2">Phút</span>
                  </div>
                  <div className="text-4xl font-black text-zinc-700 self-center -translate-y-3">:</div>
                  <div className="flex flex-col items-center">
                    <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-20 h-20 flex items-center justify-center shadow-inner">
                      <span className="text-4xl font-black text-red-500 tracking-tight">{String(timeLeft.seconds).padStart(2, '0')}</span>
                    </div>
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mt-2">Giây</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Category Tabs Section */}
      <section className="container mt-16 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h2 className="text-3xl font-black tracking-tight flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-orange-400 fill-current" />
              Sản phẩm Khuyến mãi
            </h2>
            <p className="text-zinc-400 text-sm">Danh sách các sản phẩm đang được giảm giá cực sâu hôm nay.</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveTab(cat)}
                className={`px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-wider border transition-all ${
                  activeTab === cat
                    ? "bg-red-500 border-red-500 text-white shadow-lg shadow-red-500/20"
                    : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700"
                }`}
              >
                {cat === "all" ? "Tất cả" : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Content list block */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-red-500" />
            <p className="text-zinc-400 font-medium">Đang tải sản phẩm khuyến mãi...</p>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-8 text-center space-y-4 max-w-md mx-auto">
            <p className="text-red-400 font-semibold">{error}</p>
            <Button variant="outline" onClick={() => window.location.reload()}>Tải lại trang</Button>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-32 space-y-4">
            <div className="text-6xl">🏷️</div>
            <h3 className="text-xl font-bold">Hiện không có ưu đãi nào phù hợp</h3>
            <p className="text-zinc-500">Vui lòng quay lại sau để săn thêm nhiều ưu đãi hấp dẫn khác.</p>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            <AnimatePresence>
              {filteredProducts.map((product) => (
                <motion.div
                  key={product._id}
                  variants={itemVariants}
                  layout
                >
                  <ProductCard
                    id={product._id}
                    name={product.tenSP}
                    price={product.gia}
                    giaCu={product.giaCu}
                    image={product.hinhAnh?.[0]}
                    category={product.loai?.tenDM}
                    rating={product.danhGiaTB}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </section>
    </div>
  )
}
