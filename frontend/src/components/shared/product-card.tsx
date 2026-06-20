"use client"

import { useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { ShoppingCart, Star, Zap } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"

interface ProductCardProps {
  id: string
  name: string
  price: number
  giaCu?: number
  image: string
  category?: string
  rating?: number
  isHot?: boolean
}

export function ProductCard({ id, name, price, giaCu, image, category, rating, isHot = false }: ProductCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  
  // Tính toán phần trăm giảm giá nếu có giaCu > price
  const discountPercent = giaCu && giaCu > price ? Math.round(((giaCu - price) / giaCu) * 100) : 0

  // Xử lý hiệu ứng mousemove - theo dõi vị trí chuột để tạo hiệu ứng gradient
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    // Lấy vị trí của phần tử
    const rect = cardRef.current.getBoundingClientRect()
    // Tính toán tọa độ chuột tương đối với card
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    // Cập nhật CSS variables cho hiệu ứng mousemove
    cardRef.current.style.setProperty("--mouse-x", `${x}px`)
    cardRef.current.style.setProperty("--mouse-y", `${y}px`)
  }

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      whileHover={{ y: -10 }}
      transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
      className="spotlight-card group relative overflow-hidden rounded-[2rem] border bg-card p-4 transition-all hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] hover:border-primary/30"
    >
      <Link href={`/products/${id}`} className="block overflow-hidden rounded-[1.5rem] relative z-10">
        <div className="aspect-square relative bg-zinc-50 dark:bg-zinc-900 overflow-hidden">
          <Image
            src={image || "https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=500&q=80"}
            alt={name}
            fill
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          />

          {/* Floating Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {discountPercent > 0 && (
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ repeat: Infinity, duration: 3 }}
                className="flex items-center gap-1.5 rounded-full bg-red-500 px-3 py-1 text-[10px] font-black text-white shadow-lg"
              >
                <span>-{discountPercent}% OFF</span>
              </motion.div>
            )}
            {isHot && (
              <motion.div
                animate={{ y: [0, -4, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="flex items-center gap-1.5 rounded-full bg-orange-500 px-3 py-1 text-[10px] font-black text-white shadow-lg"
              >
                <Zap className="h-3 w-3 fill-current" />
                <span>HOT</span>
              </motion.div>
            )}
          </div>

          {rating && rating > 0 && (
            <div className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full bg-white/80 dark:bg-black/80 px-3 py-1 text-[10px] font-black shadow-xl backdrop-blur-md">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span>{rating}</span>
            </div>
          )}
        </div>
      </Link>

      <div className="mt-5 px-2 space-y-3 relative z-10">
        <div className="flex items-center justify-between">
          {category && (
            <p className="text-[10px] font-black text-primary uppercase tracking-[0.25em]">{category}</p>
          )}
          <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" title="In stock" />
        </div>

        <Link href={`/products/${id}`} className="block">
          <h3 className="line-clamp-2 text-base font-bold group-hover:text-primary transition-colors h-12 leading-tight tracking-tight">{name}</h3>
        </Link>

        <div className="flex items-center justify-between pt-2">
          <div className="flex flex-col">
            {discountPercent > 0 && giaCu !== undefined ? (
              <p className="text-xs text-muted-foreground line-through opacity-50">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(giaCu)}
              </p>
            ) : (
              <div className="h-4" />
            )}
            <p className="text-xl font-black text-primary tracking-tighter">
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)}
            </p>
          </div>
          <motion.div whileTap={{ scale: 0.9 }}>
            <Button size="icon" className="h-11 w-11 rounded-2xl shadow-lg shadow-primary/20 hover:scale-110 transition-transform">
              <ShoppingCart className="h-5 w-5" />
              <span className="sr-only">Add to Cart</span>
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Subtle border glow on hover */}
      <div className="absolute inset-0 rounded-[2rem] border-2 border-transparent group-hover:border-primary/10 transition-colors pointer-events-none" />
    </motion.div>
  )
}
