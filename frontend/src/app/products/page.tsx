"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Filter, Loader2, Search as SearchIcon, SlidersHorizontal, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProductCard } from "@/components/shared/product-card"
import { apiRequest } from "@/lib/api-client"

interface Category {
  _id: string
  tenDM: string
}

function ProductsPageContent() {
  const searchParams = useSearchParams()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    searchParams.get("category") || null
  )
  const [minPrice, setMinPrice] = useState("")
  const [maxPrice, setMaxPrice] = useState("")

  // Tải danh sách danh mục
  const loadCategories = async () => {
    try {
      const data = await apiRequest("/categories")
      setCategories(data)
    } catch (err: any) {
      console.error("Lỗi tải danh mục:", err)
    }
  }

  const fetchProducts = async () => {
    // Bật đầu tải dữ liệu sản phẩm
    setIsLoading(true)
    try {
      // Xây dựng query string
      const params = new URLSearchParams()
      if (search) params.append("search", search)
      if (selectedCategory) params.append("category", selectedCategory)
      if (minPrice) params.append("minPrice", minPrice)
      if (maxPrice) params.append("maxPrice", maxPrice)

      const queryString = params.toString()
      // Gọi API lấy danh sách sản phẩm với bộ lọc
      const data = await apiRequest(`/products${queryString ? `?${queryString}` : ''}`)
      setProducts(data)
    } catch (err: any) {
      // Xử lý lỗi khi lấy dữ liệu thất bại
      setError(err.message || "Failed to load products list.")
    } finally {
      // Tắt trạng thái loading
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // Tải danh mục khi component tải
    loadCategories()
  }, [])

  useEffect(() => {
    // Lấy danh sách sản phẩm khi component tải hoặc filter thay đổi
    fetchProducts()
  }, [search, selectedCategory, minPrice, maxPrice])

  const handleSearch = (e: React.FormEvent) => {
    // Ngăn chặn hành động mặc định của form
    e.preventDefault()
    // Tịm kiếm sản phẩm theo từ khóa
    fetchProducts()
  }

  const handleClearFilters = () => {
    setSearch("")
    setSelectedCategory(null)
    setMinPrice("")
    setMaxPrice("")
  }

  return (
    <div className="container py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold tracking-tight">All Products</h1>
          <p className="text-muted-foreground">Discover thousands of high-quality tech products</p>
        </div>

        <form onSubmit={handleSearch} className="flex w-full max-w-md items-center gap-2">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 w-full rounded-full border border-input bg-background pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <Button type="submit" className="rounded-full px-6">Search</Button>
        </form>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filters - Desktop */}
        <aside className="hidden lg:block space-y-8">
          <div className="space-y-4">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4" /> Filters
            </h3>

            {/* Category Filter */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">Categories</p>
                {selectedCategory && (
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className="text-xs text-primary hover:underline"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="space-y-1">
                {categories.map(cat => (
                  <label key={cat._id} className="flex items-center gap-2 text-sm cursor-pointer hover:text-primary transition-colors">
                    <input
                      type="checkbox"
                      checked={selectedCategory === cat._id}
                      onChange={(e) => setSelectedCategory(e.target.checked ? cat._id : null)}
                      className="rounded border-input text-primary focus:ring-primary"
                    />
                    {cat.tenDM}
                  </label>
                ))}
              </div>
            </div>

            {/* Price Range Filter */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">Price Range</p>
                {(minPrice || maxPrice) && (
                  <button
                    onClick={() => { setMinPrice(""); setMaxPrice(""); }}
                    className="text-xs text-primary hover:underline"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="From"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="h-8 rounded border px-2 text-xs"
                />
                <input
                  type="number"
                  placeholder="To"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="h-8 rounded border px-2 text-xs"
                />
              </div>
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="lg:col-span-3">
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-muted-foreground">Showing <strong>{products.length}</strong> products</p>
            <Button variant="ghost" size="sm" className="lg:hidden gap-2">
              <Filter className="h-4 w-4" /> Filter
            </Button>
            <select className="text-sm bg-background border rounded-md p-1 focus:outline-none focus:ring-1 focus:ring-primary">
              <option>Newest</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
              <option>Best Selling</option>
            </select>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-32 gap-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-muted-foreground font-medium">Loading products...</p>
            </div>
          ) : error ? (
            <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center space-y-4">
              <p className="text-destructive font-medium">{error}</p>
              <Button variant="outline" onClick={fetchProducts}>Try Again</Button>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-32 space-y-4">
              <div className="text-6xl">🔍</div>
              <h3 className="text-xl font-bold">No products found</h3>
              <p className="text-muted-foreground">Try changing your search keywords or filters</p>
              <Button variant="outline" onClick={handleClearFilters}>Clear Filters</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {products.map((p: any) => (
                <ProductCard
                  key={p._id}
                  id={p._id}
                  name={p.tenSP}
                  price={p.gia}
                  giaCu={p.giaCu}
                  image={p.hinhAnh?.[0]}
                  category={p.loai?.tenDM}
                  rating={p.danhGiaTB}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ProductsPage() {
  return (
    <Suspense fallback={null}>
      <ProductsPageContent />
    </Suspense>
  )
}
