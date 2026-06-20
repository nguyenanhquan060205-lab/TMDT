"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Truck, ShieldCheck, Clock, ChevronLeft, ChevronRight, Sparkles } from "lucide-react"
import { motion, AnimatePresence, useScroll, useSpring } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ProductCard } from "@/components/shared/product-card"
import { apiRequest } from "@/lib/api-client"

interface Category {
  _id: string
  tenDM: string
}

const HERO_SLIDES = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&q=80",
    color: "from-blue-900/40"
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1600&q=80",
    color: "from-indigo-900/40"
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1600&q=80",
    color: "from-slate-900/40"
  }
]

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [categories, setCategories] = useState<Category[]>([])
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  })

  // Tự động chuyển slide mặc định sau 5 giây
  useEffect(() => {
    const timer = setInterval(() => {
      // Chuyển đến slide tiếp theo, nếu đấy là slide cuối thì quay lại đầu
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length)
    }, 5000)
    // Xóa timer khi component unmount
    return () => clearInterval(timer)
  }, [])

  // Tải danh mục
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await apiRequest("/categories")
        setCategories(data)
      } catch (err) {
        console.error("Lỗi tải danh mục:", err)
      }
    }
    loadCategories()
  }, [])

  // Chuyển sang slide tiếp theo
  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length)
  // Quay lại slide trước đó
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)

  // Dữ liệu sản phẩm nổi bật
  const featuredProducts = [
    { id: "1", name: "ASUS ROG Zephyrus G14 Gaming Laptop", price: 45000000, giaCu: 49500000, image: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=500&q=80", category: "Laptop", isHot: true, rating: 4.9 },
    { id: "2", name: "iPhone 15 Pro Max 512GB Titanium", price: 34990000, giaCu: 39990000, image: "https://images.unsplash.com/photo-1696446701796-da61225697cc?w=500&q=80", category: "Smartphone", isHot: true, rating: 4.8 },
    { id: "3", name: "Sony WH-1000XM5 Noise Canceling", price: 8490000, giaCu: 9990000, image: "https://images.unsplash.com/photo-1618366712277-728ed2f19702?w=500&q=80", category: "Accessories", rating: 4.7 },
    { id: "4", name: "Keychron K2 V2 Mechanical Keyboard", price: 2150000, giaCu: 2450000, image: "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=500&q=80", category: "Accessories", rating: 4.5 },
  ]

  // Icon mapping cho danh mục
  const categoryIcons: Record<string, string> = {
    "Điện thoại": "📱",
    "Laptop": "💻",
    "Phụ kiện": "🎧",
    "Đồng hồ": "⌚",
    "Camera": "📷",
    "Gia dụng": "🏠",
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  }

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: [0.23, 1, 0.32, 1] as any }
    }
  }

  return (
    <div className="flex flex-col gap-16 pb-24 overflow-hidden relative">
      {/* Scroll Progress Bar */}
      <motion.div className="fixed top-0 left-0 right-0 h-1 bg-primary z-[60] origin-left" style={{ scaleX }} />

      {/* Floating Blobs */}
      <div className="absolute top-[20%] left-[-10%] w-[40%] h-[30%] bg-primary/5 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-[20%] right-[-10%] w-[40%] h-[30%] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* Hero Section */}
      <section className="relative h-[480px] md:h-[520px] lg:h-[580px] w-full overflow-hidden bg-zinc-950 text-white">
        {/* Sliding Background Layer */}
        <div className="absolute inset-0 z-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 1.8, ease: "easeInOut" }}
              className="absolute inset-0"
            >
              <div className={`absolute inset-0 bg-gradient-to-r ${HERO_SLIDES[currentSlide].color} via-zinc-950/80 to-zinc-950/40 z-10`} />
              <Image
                src={HERO_SLIDES[currentSlide].image}
                alt="Background"
                fill
                className="object-cover opacity-50"
                priority
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Static Content Layer */}
        <div className="container relative z-20 flex h-full flex-col justify-center py-10 md:py-20">
          <div className="max-w-4xl space-y-8">
            <motion.div
              initial={{ x: -40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 1, ease: [0.23, 1, 0.32, 1] }}
              className="space-y-4"
            >
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-2 text-primary font-black text-xs uppercase tracking-[0.3em]"
              >
                <Sparkles className="h-4 w-4 fill-current" />
                <span>New Arrival 2026</span>
              </motion.div>
              <h1 className="text-5xl font-black tracking-tighter sm:text-7xl lg:text-9xl leading-[1] md:leading-[0.9]">
                Elevate <br />
                <span className="text-primary bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-emerald-400">Your Style</span>
              </h1>
            </motion.div>

            <motion.p
              initial={{ x: -40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 1, delay: 0.2, ease: [0.23, 1, 0.32, 1] }}
              className="text-lg md:text-2xl text-zinc-300/80 font-medium max-w-xl leading-relaxed"
            >
              Experience the pinnacle of tech shopping with the latest premium devices.
              Exclusive offers tailored just for you.
            </motion.p>

            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 1, delay: 0.4, ease: [0.23, 1, 0.32, 1] }}
              className="flex flex-wrap gap-5 pt-4"
            >
              <Button size="lg" className="rounded-full h-14 px-10 text-lg font-bold shadow-[0_20px_40px_rgba(59,130,246,0.3)] hover:scale-105 transition-all active:scale-95" asChild>
                <Link href="/products">
                  Shop Now <ArrowRight className="ml-2 h-6 w-6" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="rounded-full h-14 px-10 text-lg font-bold border-white/10 backdrop-blur-xl text-black hover:bg-white hover:text-black hover:scale-105 transition-all active:scale-95" asChild>
                <Link href="/categories">Explore More</Link>
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Carousel Indicators */}
        <div className="absolute bottom-10 left-10 z-30 flex gap-3">
          {HERO_SLIDES.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-1 rounded-full transition-all duration-500 ${currentSlide === index ? "w-16 bg-primary" : "w-4 bg-white/20 hover:bg-white/40"
                }`}
            />
          ))}
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-30 h-10 w-10 rounded-full bg-white/5 backdrop-blur-md flex items-center justify-center border border-white/10 hover:bg-primary transition-all group hidden sm:flex"
        >
          <ChevronLeft className="h-5 w-5 text-white" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-30 h-10 w-10 rounded-full bg-white/5 backdrop-blur-md flex items-center justify-center border border-white/10 hover:bg-primary transition-all group hidden sm:flex"
        >
          <ChevronRight className="h-5 w-5 text-white" />
        </button>
      </section>

      {/* Features Section */}
      <section className="container">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 gap-8 md:grid-cols-3"
        >
          {[
            { icon: Truck, title: "Free Shipping", desc: "Orders over $50", color: "bg-blue-500/10 text-blue-500" },
            { icon: ShieldCheck, title: "Official Warranty", desc: "100% Genuine Products", color: "bg-emerald-500/10 text-emerald-500" },
            { icon: Clock, title: "Support 24/7", desc: "Dedicated Customer Care", color: "bg-purple-500/10 text-purple-500" },
          ].map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ y: -8 }}
              className="flex flex-col gap-4 rounded-[2.5rem] border bg-card/50 backdrop-blur-sm p-8 shadow-sm hover:shadow-xl transition-all border-white/5"
            >
              <div className={`rounded-2xl p-4 w-fit ${feature.color}`}>
                <feature.icon className="h-7 w-7" />
              </div>
              <div className="space-y-1">
                <h3 className="font-black text-xl tracking-tight">{feature.title}</h3>
                <p className="text-sm text-muted-foreground font-medium">{feature.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Categories Section */}
      <section className="container space-y-10">
        <div className="flex items-end justify-between">
          <div className="space-y-2">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-primary font-black text-xs uppercase tracking-[0.3em]"
            >
              Collections
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="text-4xl md:text-6xl font-black tracking-tighter"
            >
              Popular Categories
            </motion.h2>
          </div>
          <Button variant="link" asChild className="font-black text-base group">
            <Link href="/categories" className="flex items-center gap-2">
              View All <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-6"
        >
          {categories.map((cat) => (
            <motion.div key={cat._id} variants={itemVariants}>
              <Link
                href={`/categories/${cat._id}`}
                className="group flex flex-col items-center justify-center gap-4 rounded-[2rem] border bg-card p-10 transition-all hover:border-primary hover:shadow-2xl hover:-translate-y-2 border-white/5"
              >
                <motion.span
                  whileHover={{ scale: 1.2, rotate: 8 }}
                  className="text-6xl filter drop-shadow-lg"
                >
                  {categoryIcons[cat.tenDM] || "📦"}
                </motion.span>
                <span className="font-black text-[10px] uppercase tracking-[0.2em] text-muted-foreground group-hover:text-primary transition-colors text-center">
                  {cat.tenDM}
                </span>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Featured Products Section */}
      <section className="container space-y-12">
        <div className="flex items-end justify-between">
          <div className="space-y-2">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-primary font-black text-xs uppercase tracking-[0.3em]"
            >
              Trending Now
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="text-4xl md:text-6xl font-black tracking-tighter"
            >
              Featured Products
            </motion.h2>
          </div>
          <Button variant="outline" asChild className="rounded-full px-8 h-12 font-black border-2 hover:bg-primary hover:border-primary hover:text-white transition-all shadow-lg">
            <Link href="/products">Shop All Products</Link>
          </Button>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4"
        >
          {featuredProducts.map((product) => (
            <motion.div key={product.id} variants={itemVariants}>
              <ProductCard {...product} />
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Newsletter Section */}
      <section className="container">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
          className="rounded-[3rem] bg-zinc-950 border border-white/5 px-8 py-20 text-white md:px-24 md:py-28 shadow-3xl relative overflow-hidden"
        >
          {/* Animated Background for newsletter */}
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ repeat: Infinity, duration: 10 }}
            className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[140px] pointer-events-none"
          />
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{ repeat: Infinity, duration: 15, delay: 2 }}
            className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[140px] pointer-events-none"
          />

          <div className="mx-auto flex max-w-4xl flex-col items-center text-center gap-10 relative z-10">
            <div className="space-y-4">
              <p className="text-primary font-black text-xs uppercase tracking-[0.4em]">Stay Updated</p>
              <h2 className="text-5xl font-black md:text-8xl tracking-tighter leading-[0.9]">
                Connect <br /> <span className="text-primary">Passion</span>
              </h2>
            </div>
            <p className="text-lg md:text-2xl text-zinc-400 font-medium max-w-2xl leading-relaxed">
              Get the earliest updates on limited products and an exclusive 10% discount code for new members.
            </p>
            <form className="flex w-full max-w-xl flex-col gap-4 sm:flex-row mt-4">
              <input
                type="email"
                placeholder="Email Address"
                className="flex-1 rounded-full bg-white/5 border border-white/10 px-10 py-5 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-zinc-600 font-bold"
                required
              />
              <Button type="submit" size="lg" className="rounded-full h-16 px-12 font-black hover:scale-105 transition-all active:scale-95 shadow-2xl shadow-primary/30">
                Join Now
              </Button>
            </form>
          </div>
        </motion.div>
      </section>
    </div>
  )
}
