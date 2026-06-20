"use client"

import { useEffect, useState } from "react"
import { Plus, Pencil, Trash2, X, Loader2, ArrowLeft, Image as ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { apiRequest } from "@/lib/api-client"

interface Category {
  _id: string
  tenDM: string
}

interface Product {
  _id: string
  tenSP: string
  moTa: string
  gia: number
  giaCu?: number
  soLuong: number
  hinhAnh: string[]
  loai: {
    _id: string
    tenDM: string
  } | string
  trangThai: 'active' | 'inactive'
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")

  // Form states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState({
    tenSP: "",
    moTa: "",
    gia: 0,
    giaCu: 0,
    soLuong: 0,
    hinhAnh: "",
    loai: "",
    trangThai: "active" as "active" | "inactive"
  })

  const loadData = async () => {
    setIsLoading(true)
    setError("")
    try {
      const [productsData, categoriesData] = await Promise.all([
        apiRequest("/products?status=all"),
        apiRequest("/categories")
      ])
      setProducts(productsData)
      setCategories(categoriesData)
    } catch (err: any) {
      setError(err.message || "Không thể tải dữ liệu.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleOpenAddModal = () => {
    setEditingProduct(null)
    setFormData({
      tenSP: "",
      moTa: "",
      gia: 0,
      giaCu: 0,
      soLuong: 0,
      hinhAnh: "",
      loai: categories[0]?._id || "",
      trangThai: "active"
    })
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      tenSP: product.tenSP,
      moTa: product.moTa,
      gia: product.gia,
      giaCu: product.giaCu || 0,
      soLuong: product.soLuong,
      hinhAnh: product.hinhAnh?.join(", ") || "",
      loai: typeof product.loai === "object" ? product.loai._id : product.loai,
      trangThai: product.trangThai
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa sản phẩm này? Hành động này không thể hoàn tác.")) return

    try {
      await apiRequest(`/products/${id}`, {
        method: "DELETE"
      })
      // Cập nhật lại danh sách local
      setProducts(prev => prev.filter(p => p._id !== id))
    } catch (err: any) {
      alert(err.message || "Xóa sản phẩm thất bại.")
    }
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError("")

    // Chuyển đổi chuỗi URL hình ảnh phân tách bằng dấu phẩy thành mảng
    const hinhAnhArray = formData.hinhAnh
      ? formData.hinhAnh.split(",").map(url => url.trim()).filter(Boolean)
      : []

    const payload = {
      ...formData,
      hinhAnh: hinhAnhArray
    }

    try {
      if (editingProduct) {
        // Cập nhật
        const updated = await apiRequest(`/products/${editingProduct._id}`, {
          method: "PUT",
          body: JSON.stringify(payload)
        })
        
        // Load lại dữ liệu toàn bộ để đồng bộ danh mục populate
        loadData()
      } else {
        // Tạo mới
        await apiRequest("/products", {
          method: "POST",
          body: JSON.stringify(payload)
        })
        loadData()
      }
      setIsModalOpen(false)
    } catch (err: any) {
      setError(err.message || "Lưu sản phẩm thất bại.")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-[60vh] w-full flex-col items-center justify-center gap-4 text-zinc-400">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="font-semibold">Đang tải danh sách sản phẩm...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight">Quản lý Sản phẩm</h1>
          <p className="text-zinc-400 mt-1">Danh sách sản phẩm đang bán và quản lý kho.</p>
        </div>
        <Button onClick={handleOpenAddModal} className="rounded-xl px-5 h-11 gap-2 bg-primary">
          <Plus className="h-5 w-5" /> Thêm sản phẩm
        </Button>
      </div>

      {error && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm font-medium text-destructive">
          {error}
        </div>
      )}

      {/* Danh sách sản phẩm */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-zinc-800">
          <h2 className="text-xl font-bold">Tất cả sản phẩm ({products.length})</h2>
        </div>

        {products.length === 0 ? (
          <div className="p-12 text-center text-zinc-500">
            Chưa có sản phẩm nào. Nhấp vào "Thêm sản phẩm" để bắt đầu.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-zinc-900 border-b border-zinc-800 text-zinc-400 text-xs uppercase tracking-wider">
                  <th className="p-5 font-extrabold">Hình ảnh</th>
                  <th className="p-5 font-extrabold">Tên sản phẩm</th>
                  <th className="p-5 font-extrabold">Danh mục</th>
                  <th className="p-5 font-extrabold">Đơn giá</th>
                  <th className="p-5 font-extrabold">Kho hàng</th>
                  <th className="p-5 font-extrabold">Trạng thái</th>
                  <th className="p-5 font-extrabold text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800 bg-zinc-900/20">
                {products.map((product) => {
                  const productImage = product.hinhAnh?.[0] || "https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=100&q=80"
                  const catName = typeof product.loai === "object" ? product.loai.tenDM : product.loai
                  return (
                    <tr key={product._id} className="hover:bg-zinc-800/40 transition-colors">
                      <td className="p-5">
                        <div className="relative h-12 w-12 rounded-lg border bg-white overflow-hidden flex items-center justify-center shrink-0">
                          <img src={productImage} alt={product.tenSP} className="object-contain w-full h-full p-1" />
                        </div>
                      </td>
                      <td className="p-5">
                        <div className="font-extrabold max-w-xs truncate">{product.tenSP}</div>
                      </td>
                      <td className="p-5 text-zinc-400 font-medium">{catName || "Chưa phân loại"}</td>
                      <td className="p-5 font-extrabold text-primary">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.gia)}
                      </td>
                      <td className="p-5 font-bold">
                        {product.soLuong > 0 ? (
                          <span className="text-emerald-500">{product.soLuong} chiếc</span>
                        ) : (
                          <span className="text-destructive font-black">Hết hàng</span>
                        )}
                      </td>
                      <td className="p-5">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${
                          product.trangThai === "active" ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" : "bg-zinc-800 text-zinc-400"
                        }`}>
                          {product.trangThai === "active" ? "Kinh doanh" : "Ngừng bán"}
                        </span>
                      </td>
                      <td className="p-5 text-right space-x-2">
                        <Button 
                          onClick={() => handleOpenEditModal(product)} 
                          variant="ghost" 
                          size="icon" 
                          className="text-zinc-400 hover:text-white hover:bg-zinc-800"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          onClick={() => handleDelete(product._id)} 
                          variant="ghost" 
                          size="icon" 
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Thêm/Sửa sản phẩm */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative">
            <button 
              onClick={() => setIsModalOpen(false)} 
              className="absolute right-6 top-6 text-zinc-400 hover:text-white transition-colors"
            >
              <X className="h-6 w-6" />
            </button>

            <div className="p-8 space-y-6">
              <div>
                <h2 className="text-2xl font-black">{editingProduct ? "Chỉnh sửa Sản phẩm" : "Thêm Sản phẩm mới"}</h2>
                <p className="text-zinc-400 text-sm mt-1">Cung cấp các thông tin chi tiết của sản phẩm.</p>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label htmlFor="tenSP" className="text-sm font-semibold">Tên sản phẩm</label>
                  <input
                    id="tenSP"
                    type="text"
                    value={formData.tenSP}
                    onChange={(e) => setFormData(prev => ({ ...prev, tenSP: e.target.value }))}
                    placeholder="Ví dụ: Laptop Dell XPS 13"
                    className="h-11 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-white"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="loai" className="text-sm font-semibold">Danh mục</label>
                    <select
                      id="loai"
                      value={formData.loai}
                      onChange={(e) => setFormData(prev => ({ ...prev, loai: e.target.value }))}
                      className="h-11 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-white"
                      required
                    >
                      {categories.map(cat => (
                        <option key={cat._id} value={cat._id}>{cat.tenDM}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="trangThai" className="text-sm font-semibold">Trạng thái bán</label>
                    <select
                      id="trangThai"
                      value={formData.trangThai}
                      onChange={(e) => setFormData(prev => ({ ...prev, trangThai: e.target.value as any }))}
                      className="h-11 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-white"
                    >
                      <option value="active">Đang kinh doanh (Active)</option>
                      <option value="inactive">Ngừng kinh doanh (Inactive)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="gia" className="text-sm font-semibold">Giá bán (VND)</label>
                    <input
                      id="gia"
                      type="number"
                      value={formData.gia}
                      onChange={(e) => setFormData(prev => ({ ...prev, gia: Number(e.target.value) }))}
                      placeholder="15000000"
                      className="h-11 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-white"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="giaCu" className="text-sm font-semibold">Giá gốc/cũ (VND)</label>
                    <input
                      id="giaCu"
                      type="number"
                      value={formData.giaCu}
                      onChange={(e) => setFormData(prev => ({ ...prev, giaCu: Number(e.target.value) }))}
                      placeholder="18000000"
                      className="h-11 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="soLuong" className="text-sm font-semibold">Số lượng kho</label>
                    <input
                      id="soLuong"
                      type="number"
                      value={formData.soLuong}
                      onChange={(e) => setFormData(prev => ({ ...prev, soLuong: Number(e.target.value) }))}
                      placeholder="50"
                      className="h-11 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-white"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="hinhAnh" className="text-sm font-semibold">Hình ảnh (URLs)</label>
                  <input
                    id="hinhAnh"
                    type="text"
                    value={formData.hinhAnh}
                    onChange={(e) => setFormData(prev => ({ ...prev, hinhAnh: e.target.value }))}
                    placeholder="Link ảnh 1, Link ảnh 2... (Phân cách bằng dấu phẩy)"
                    className="h-11 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-white"
                  />
                  <span className="text-[10px] text-zinc-500 block">Để trống sẽ tự động lấy ảnh Unsplash mặc định.</span>
                </div>

                <div className="space-y-2">
                  <label htmlFor="moTa" className="text-sm font-semibold">Mô tả chi tiết</label>
                  <textarea
                    id="moTa"
                    value={formData.moTa}
                    onChange={(e) => setFormData(prev => ({ ...prev, moTa: e.target.value }))}
                    placeholder="Nhập thông tin mô tả cấu hình sản phẩm..."
                    className="min-h-24 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-white"
                    required
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <Button 
                    type="button" 
                    variant="ghost" 
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 rounded-xl h-12 text-zinc-400 hover:text-white"
                  >
                    Hủy bỏ
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isSaving} 
                    className="flex-1 rounded-xl h-12 bg-primary"
                  >
                    {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : "Lưu thay đổi"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
