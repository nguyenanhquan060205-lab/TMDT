import Link from "next/link"
import { Facebook, Instagram, Twitter, Youtube } from "lucide-react"

// Component hiển thị footer của trang web
export function Footer() {
  return (
    <footer className="border-t bg-zinc-50 dark:bg-zinc-900">
      <div className="container py-12 md:py-16">
        {/* Dạng lưới 5 cột: thông tin công ty + 4 mục điều hướng */}
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
          {/* Cột 1-2: Logo, mô tả công ty và liên kết mạng xã hội */}
          <div className="col-span-2 lg:col-span-2">
            <Link href="/" className="text-2xl font-bold text-primary">ELEVEN</Link>
            <p className="mt-4 max-w-xs text-sm text-muted-foreground leading-relaxed">
              ELEVEN is a leading e-commerce platform providing genuine technology products at the best market prices.
            </p>
            {/* Các liên kết mạng xã hội */}
            <div className="mt-6 flex gap-4">
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Facebook className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Instagram className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Youtube className="h-5 w-5" />
              </Link>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">Products</h3>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li><Link href="/categories/phone" className="hover:text-primary transition-colors">Smartphones</Link></li>
              <li><Link href="/categories/laptop" className="hover:text-primary transition-colors">Laptops</Link></li>
              <li><Link href="/categories/accessories" className="hover:text-primary transition-colors">Accessories</Link></li>
              <li><Link href="/deals" className="hover:text-primary transition-colors">Special Deals</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">Support</h3>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li><Link href="#" className="hover:text-primary transition-colors">Help Center</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Shipping</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Returns</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Contact Us</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">Legal</h3>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li><Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Terms of Service</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Cookies</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
          <p>© 2026 ELEVEN. All rights reserved.</p>
          <div className="flex gap-6">
            <span>Vietnam (USD)</span>
            <div className="flex gap-2">
              <span className="h-6 w-10 rounded border bg-white flex items-center justify-center font-bold text-[8px] text-blue-800">VISA</span>
              <span className="h-6 w-10 rounded border bg-white flex items-center justify-center font-bold text-[8px] text-red-600">MASTER</span>
              <span className="h-6 w-10 rounded border bg-white flex items-center justify-center font-bold text-[8px] text-blue-600">PayPal</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
