NHÓM 1 — XÁC THỰC & PHÂN QUYỀN (ưu tiên cao nhất)
Prompt 1.1 — Đăng nhập mạng xã hội (Google & Facebook OAuth)
Hãy bổ sung đăng nhập bằng Google và Facebook cho dự án Eleven.

Backend (Express + Mongoose):
- Cập nhật IUser trong usersModel.ts: thêm các trường googleId, facebookId, authProvider ('local' | 'google' | 'facebook'), và cho phép matKhau là optional khi authProvider khác 'local'.
- Cài passport, passport-google-oauth20, passport-facebook (hoặc dùng luồng verify token thủ công bằng google-auth-library nếu muốn kiến trúc REST API thuần, không session).
- Tạo route POST /api/auth/google và POST /api/auth/facebook: nhận id_token/access_token từ frontend, verify với Google/Facebook, tìm hoặc tạo user tương ứng, trả về JWT giống luồng login thường.
- Xử lý case: email đã tồn tại với tài khoản local -> tự động liên kết (link) tài khoản theo email, không tạo user trùng.

Frontend (Next.js):
- Trang /auth/login và /auth/register: thêm nút "Đăng nhập với Google" và "Đăng nhập với Facebook" dùng @react-oauth/google và Facebook SDK.
- Sau khi nhận token từ Google/Facebook, gọi API backend tương ứng, lưu JWT vào localStorage giống luồng cũ, redirect về trang chủ.

Biến môi trường cần thêm vào .env: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, FACEBOOK_APP_ID, FACEBOOK_APP_SECRET.

Prompt 1.2 — Refresh Token & Bảo mật phiên đăng nhập
Hiện tại hệ thống chỉ dùng 1 JWT access token. Hãy nâng cấp lên mô hình access token + refresh token:

- Access token: thời hạn ngắn (15 phút), trả về trong response body như hiện tại.
- Refresh token: thời hạn dài (7-30 ngày), lưu trong HttpOnly Cookie (không lưu localStorage để chống XSS), lưu kèm hash trong DB (model RefreshToken: user, tokenHash, expiresAt, userAgent, ip) để có thể revoke.
- Thêm route POST /api/auth/refresh: đọc cookie, kiểm tra hợp lệ, cấp access token mới.
- Thêm route POST /api/auth/logout: xóa refresh token trong DB và clear cookie.
- Thêm route GET /api/auth/sessions và DELETE /api/auth/sessions/:id để người dùng xem và đăng xuất từ xa các thiết bị khác (giống Google/Facebook).
- Cập nhật api-client.ts ở frontend: tự động gọi /api/auth/refresh khi access token hết hạn (interceptor 401), retry request gốc.

Prompt 1.3 — Xác thực Email & Quên mật khẩu

Bổ sung luồng xác thực email và quên mật khẩu cho Eleven:

- Thêm trường emailVerified (boolean), otpCode, otpExpiresAt vào usersModel.ts.
- Cài nodemailer (dùng SMTP Gmail hoặc Resend/SendGrid).
- POST /api/auth/send-otp: gửi mã OTP 6 số tới email khi đăng ký.
- POST /api/auth/verify-otp: xác thực email.
- POST /api/auth/forgot-password: gửi link reset (token random + hết hạn 15 phút) qua email.
- POST /api/auth/reset-password/:token: đặt lại mật khẩu mới.
- Frontend: trang /auth/verify-email, /auth/forgot-password, /auth/reset-password/[token] với form và countdown gửi lại OTP.
- Chặn đăng nhập nếu emailVerified = false, hiển thị thông báo yêu cầu xác thực và nút gửi lại.

Prompt 1.4 — Phân quyền chi tiết (RBAC) & Middleware bảo vệ route Next.js
Nâng cấp hệ thống phân quyền của Eleven từ 2 vai trò (user/admin) lên mô hình linh hoạt hơn, đồng thời chặn truy cập trái phép ở cả 2 lớp:

Backend:
- Mở rộng vaiTro thành 'user' | 'staff' | 'admin' (staff: chỉ quản lý đơn hàng/sản phẩm, không quản lý người dùng/thống kê doanh thu).
- Viết middleware authorize(...roles) tổng quát thay cho adminOnly cứng, áp vào từng route theo nhu cầu.
- Thêm middleware kiểm tra chủ sở hữu resource (ví dụ user A không thể xem đơn hàng của user B trừ khi là admin/staff).

Frontend (Next.js App Router):
- Viết middleware.ts ở gốc dự án: đọc cookie/token, chặn truy cập trực tiếp vào /dashboard/** nếu không phải admin/staff, chặn /user/** nếu chưa đăng nhập, redirect về /auth/login kèm query ?redirect= để quay lại sau khi đăng nhập.
- Tạo hook useAuth() và component <RequireAuth roles={['admin']}> bọc các trang cần kiểm tra phía client (UX mượt hơn, tránh nháy trang trước khi middleware redirect).
- Ẩn/hiện các nút và menu (ví dụ "Quản lý sản phẩm") dựa theo vaiTro của người dùng hiện tại.

NHÓM 2 — TRẢI NGHIỆM MUA HÀNG (giống Shopee/Tiki)
Prompt 2.1 — Tìm kiếm & Lọc nâng cao
Bổ sung tìm kiếm và lọc sản phẩm nâng cao cho Eleven:

Backend:
- Nâng cấp GET /api/products: hỗ trợ query params q (tìm theo tên, dùng MongoDB text index hoặc regex không dấu), category, minPrice, maxPrice, rating, sortBy (newest | price_asc | price_desc | best_selling | rating), page, limit.
- Tạo text index trên tenSP, moTa trong productsModel.ts.
- Thêm API GET /api/products/suggest?q= trả về gợi ý autocomplete (top 5 tên sản phẩm khớp).

Frontend:
- Trang /products: thanh filter sidebar (khoảng giá dạng slider, danh mục checkbox, đánh giá từ 4 sao trở lên...), thanh sort phía trên danh sách.
- Ô tìm kiếm ở header: autocomplete dropdown gợi ý sản phẩm khi gõ, debounce 300ms, có lưu "lịch sử tìm kiếm gần đây" vào localStorage.
- URL phải đồng bộ với filter (dùng searchParams) để có thể share link hoặc back/forward trình duyệt giữ đúng trạng thái lọc.

Prompt 2.2 — Danh sách yêu thích (Wishlist) & Đã xem gần đây
Thêm tính năng Wishlist và "Sản phẩm đã xem" cho Eleven:

- Tạo wishlistModel.ts: { user, products: [productId] }.
- API: GET /api/wishlist, POST /api/wishlist/toggle/:productId (thêm/xóa), giống logic giỏ hàng.
- Icon tim ở ProductCard và trang chi tiết sản phẩm, đổi màu khi đã thích, optimistic UI update.
- Trang /user/wishlist hiển thị danh sách sản phẩm đã lưu, có nút "Thêm vào giỏ" trực tiếp.
- "Sản phẩm đã xem": lưu productId vào localStorage (giới hạn 10 sản phẩm gần nhất), hiển thị section "Đã xem gần đây" ở trang chủ và trang chi tiết sản phẩm.

Prompt 2.3 — Mã giảm giá / Voucher
Xây dựng hệ thống mã giảm giá đầy đủ cho Eleven:

- Tạo voucherModel.ts: { code, type: 'percent' | 'fixed', value, minOrderValue, maxDiscount, usageLimit, usedCount, expiresAt, active, applicableCategories (optional) }.
- API admin: CRUD voucher tại /api/admin/vouchers (đã có maGiamGia/soTienGiam trong orderModel, hãy liên kết logic này).
- API POST /api/orders/apply-voucher: kiểm tra mã hợp lệ (hạn dùng, số lượt, giá trị đơn tối thiểu) trước khi đặt hàng, trả về số tiền được giảm.
- Trang checkout: ô nhập mã giảm giá, hiển thị danh sách voucher khả dụng của người dùng để chọn nhanh, tự động tính lại tổng tiền.
- Trang /dashboard/vouchers cho admin quản lý.

Prompt 2.4 — Đánh giá sản phẩm nâng cao
Nâng cấp reviewModel.ts và tính năng đánh giá sản phẩm:

- Thêm trường images: string[] (cho phép đính kèm ảnh thực tế khi đánh giá), helpfulVotes: number, adminReply (optional).
- Chỉ cho phép đánh giá nếu user đã mua sản phẩm đó và đơn hàng ở trạng thái 'delivered' (kiểm tra qua orderModel).
- API POST /api/reviews/:id/helpful: vote "Hữu ích" cho đánh giá (giống Shopee/Lazada).
- API POST /api/reviews/:id/reply: admin phản hồi đánh giá.
- Frontend: hiển thị breakdown số sao (biểu đồ thanh ngang 5-4-3-2-1 sao kèm %), filter đánh giá theo số sao và "có hình ảnh", lazy load thêm đánh giá (load more).

NHÓM 3 — GIỎ HÀNG, THANH TOÁN & ĐƠN HÀNG
Prompt 3.1 — Đồng bộ giỏ hàng Guest & User
Hoàn thiện đồng bộ giỏ hàng cho Eleven:

- Khi chưa đăng nhập: giỏ hàng lưu hoàn toàn ở localStorage (Zustand store hoặc Context), không gọi API.
- Khi đăng nhập thành công (login/register/OAuth): tự động gọi API merge giỏ hàng local vào giỏ hàng DB (POST /api/cart/merge nhận danh sách items từ localStorage), cộng số lượng nếu sản phẩm đã tồn tại trong giỏ DB, sau đó xóa localStorage cart.
- Sau khi merge, mọi thao tác thêm/sửa/xóa giỏ hàng đều gọi API thật (GET/POST/PUT/DELETE /api/cart...) thay vì localStorage.
- Đảm bảo PUT /api/cart/update và POST /api/cart/add kiểm tra soLuong tồn kho thực tế trước khi cho thêm, trả lỗi rõ ràng nếu vượt quá tồn kho.

Prompt 3.2 — Test & Mô phỏng Webhook sePay hoàn chỉnh
Hoàn thiện luồng thanh toán chuyển khoản sePay cho Eleven:

- Khi tạo đơn hàng với phuongThucThanhToan = 'banking': sinh ra mã giao dịch unique (maGiaoDich, ví dụ DH + orderId + timestamp), tạo nội dung chuyển khoản chứa mã này, render QR code (dùng thư viện qrcode hoặc API VietQR) hiển thị ở trang /checkout/success hoặc /user/orders/[id].
- Controller POST /api/payments/sepay-webhook: parse nội dung chuyển khoản nhận từ sePay, tìm đơn hàng theo maGiaoDich xuất hiện trong nội dung, kiểm tra số tiền chuyển khớp với tongTien, nếu khớp -> set trangThaiThanhToan = 'paid', trừ soLuong tồn kho từng sản phẩm trong đơn, gửi email xác nhận.
- Viết script scripts/mock-sepay-webhook.ts: giả lập gọi webhook với payload mẫu của sePay để test thủ công (dùng cho cả case số tiền sai, mã không tồn tại, đã thanh toán rồi).
- Áp dụng idempotency: nếu webhook gọi lại với cùng maGiaoDich đã paid thì không trừ kho 2 lần.
- Bổ sung xác thực webhook bằng API Key sePay gửi trong header (kiểm tra đúng secret trước khi xử lý, chống giả mạo).

Prompt 3.3 — Theo dõi đơn hàng & Hóa đơn PDF
Bổ sung theo dõi trạng thái đơn hàng trực quan và xuất hóa đơn cho Eleven:

- Frontend trang /user/orders/[id]: hiển thị timeline/stepper trạng thái đơn (Chờ xác nhận -> Đang xử lý -> Đang giao -> Đã giao / Đã hủy) tương ứng trangThaiThanhToan, có icon và mốc thời gian (cần thêm trường lichSuTrangThai: [{trangThai, thoiGian}] vào orderModel.ts, ghi log mỗi lần admin đổi trạng thái).
- API GET /api/orders/:id/invoice: sinh file PDF hóa đơn (dùng pdf-lib hoặc puppeteer) gồm thông tin shop, sản phẩm, giá, tổng tiền, có thể tải về.
- Gửi email tự động kèm tóm tắt đơn hàng mỗi khi trạng thái thay đổi (đặt hàng thành công, đã giao, đã hủy).

NHÓM 4 — QUẢN TRỊ (ADMIN DASHBOARD)
Prompt 4.1 — Thống kê & Biểu đồ doanh thu
Xây dựng trang /dashboard (Tổng quan) với các widget thống kê cho Eleven, dùng recharts:

- API GET /api/admin/stats?range=7d|30d|year: trả về doanh thu theo ngày, số đơn theo trạng thái, top 5 sản phẩm bán chạy, top khách hàng mua nhiều nhất, tỉ lệ đơn hủy.
- Frontend: 4 thẻ số liệu nhanh (Doanh thu hôm nay, Đơn hàng mới, Sản phẩm sắp hết hàng, Khách hàng mới), biểu đồ đường doanh thu theo thời gian, biểu đồ tròn trạng thái đơn hàng, bảng top sản phẩm bán chạy.
- Cảnh báo "Sắp hết hàng": danh sách sản phẩm có soLuong < 10, hiển thị badge đỏ.

Prompt 4.2 — Quản lý người dùng (Admin)
Bổ sung trang quản lý người dùng cho admin tại /dashboard/users:

- API: GET /api/admin/users (phân trang, tìm theo tên/email), PUT /api/admin/users/:id/role (đổi vai trò user/staff/admin), PUT /api/admin/users/:id/status (khóa/mở khóa tài khoản — cần thêm trường trangThai: 'active' | 'banned' vào usersModel.ts và chặn login nếu banned).
- Middleware chặn admin tự hạ quyền chính mình hoặc khóa chính mình.
- Frontend: bảng danh sách user có filter theo vai trò, nút khóa/mở khóa kèm modal xác nhận, modal đổi vai trò.

Prompt 4.3 — Quản lý Banner / Slider trang chủ động
Hiện slider trang chủ đang tĩnh, hãy chuyển sang quản lý động:
- Tạo bannerModel.ts: { hinhAnh, link, tieuDe, thuTu, active, ngayBatDau, ngayKetThuc }.
- API CRUD /api/admin/banners (admin), GET /api/banners (công khai, chỉ lấy banner active và trong thời gian hiển thị).
- Trang /dashboard/banners: kéo-thả sắp xếp thứ tự (dnd-kit), upload ảnh, đặt lịch hiển thị.
- Trang chủ frontend gọi API này thay vì hardcode.

NHÓM 5 — UPLOAD ẢNH & HẠ TẦNG
Prompt 5.1 — Upload ảnh lên Cloudinary
Hoàn thiện API upload ảnh cho ELEVEN (đã cài multer nhưng chưa hoàn thiện):

- Cài cloudinary, multer-storage-cloudinary.
- Tạo middleware uploadMiddleware.ts dùng multer-storage-cloudinary, giới hạn 5MB/ảnh, chỉ nhận jpg/png/webp.
- API POST /api/upload (single), POST /api/upload/multiple (cho sản phẩm nhiều ảnh, tối đa 5 ảnh) — yêu cầu đăng nhập, trả về secure_url.
- Áp dụng cho: anhDaiDien (avatar user), hinhAnh sản phẩm, images trong review, hinhAnh banner.
- Frontend: component <ImageUploader /> tái sử dụng, có preview, progress bar, kéo-thả (drag & drop), nén ảnh phía client trước khi upload (browser-image-compression) để tăng tốc.
- Biến môi trường: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET.

Prompt 5.2 — Bảo mật Backend toàn diện
Tăng cường bảo mật cho ELEVEN theo chuẩn production:

- Cài và áp dụng: helmet (security headers), express-rate-limit (giới hạn request, đặc biệt /api/auth/login và /api/auth/register chống brute-force), express-mongo-sanitize (chống NoSQL injection), hpp (chống HTTP param pollution), cors với whitelist origin cụ thể thay vì '*'.
- Validate toàn bộ input đầu vào bằng zod hoặc express-validator cho mọi route POST/PUT (đặc biệt register, đặt hàng, đổi mật khẩu).
- Hash mật khẩu với bcrypt salt rounds >= 12 (kiểm tra lại nếu chưa đủ).
- Thêm logging có cấu trúc (winston hoặc pino) ghi log lỗi và truy cập, ẩn thông tin nhạy cảm.
- Đảm bảo mọi response lỗi không leak stack trace ở môi trường production.

Prompt 5.3 — SEO & Performance
Tối ưu SEO và hiệu năng cho frontend ELEVEN (Next.js):

- Sinh metadata động (generateMetadata) cho từng trang sản phẩm: title, description, Open Graph image lấy từ dữ liệu sản phẩm.
- Tạo sitemap.xml động (app/sitemap.ts) liệt kê tất cả sản phẩm và danh mục, robots.ts.
- Áp dụng next/image cho toàn bộ hình ảnh sản phẩm (lazy load, đúng kích thước, placeholder blur).
- Cấu hình ISR (revalidate) cho trang sản phẩm và trang chủ thay vì client-side fetch hoàn toàn, giảm thời gian tải.
- Thêm Schema.org JSON-LD (Product, BreadcrumbList, AggregateRating) cho trang chi tiết sản phẩm để hỗ trợ rich snippet trên Google.

NHÓM 6 — TÍNH NĂNG NÂNG CAO (LÀM SAU CÙNG)
Prompt 6.1 — Thông báo realtime (Notification)Thêm hệ thống thông báo cho HUIT-Shop:

- Tạo notificationModel.ts: { user, type, title, message, isRead, link, createdAt }.
- Dùng Socket.io: khi admin đổi trạng thái đơn hàng -> emit thông báo realtime tới đúng user đó; khi có đơn hàng mới -> emit cho tất cả admin/staff đang online.
- Icon chuông ở header (cả user và dashboard admin) với badge số thông báo chưa đọc, dropdown danh sách, đánh dấu đã đọc.
- API GET /api/notifications, PUT /api/notifications/:id/read, PUT /api/notifications/read-all.

Prompt 6.2 — Gợi ý sản phẩm liên quan / Recommendation
Thêm gợi ý sản phẩm thông minh cho HUIT-Shop (không cần ML phức tạp, dùng rule-based trước):

- API GET /api/products/:id/related: trả về sản phẩm cùng danh mục, sắp xếp theo danh giaTB và đã bán, loại trừ chính nó.
- Section "Khách hàng cũng mua" ở trang chi tiết sản phẩm và trang giỏ hàng/checkout (cross-sell).
- Trang chủ: section "Gợi ý cho bạn" dựa trên lịch sử "đã xem" lưu ở localStorage/DB nếu đã đăng nhập.

Prompt 6.3 — Đa ngôn ngữ (i18n) & Chế độ tối (Dark Mode)
Thêm hỗ trợ đa ngôn ngữ và dark mode cho HUIT-Shop:

- Dùng next-intl: hỗ trợ vi (mặc định) và en, tách toàn bộ text sang file locales/vi.json, locales/en.json.
- Component chuyển ngôn ngữ ở header.
- Dark mode dùng next-themes + Tailwind dark: classes, toggle ở header, lưu preference vào localStorage, tôn trọng prefers-color-scheme hệ thống khi chưa chọn.

Prompt 6.4 — Chat hỗ trợ khách hàng
Thêm chat hỗ trợ trực tiếp giữa khách hàng và admin/staff cho HUIT-Shop:

- Tạo chatModel.ts: { conversationId, participants: [user], messages: [{ sender, content, createdAt, read }] }.
- Dùng Socket.io cho realtime, lưu lịch sử vào MongoDB.
- Widget chat nổi (floating bubble) ở góc phải mọi trang user, mở popup chat.
- Trang /dashboard/chat cho admin/staff xem danh sách hội thoại và trả lời, badge số tin chưa đọc.