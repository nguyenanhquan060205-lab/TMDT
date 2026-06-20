import { Router } from 'express'
import { sepayWebhook } from '../controllers/paymentController'

const router = Router()

// Endpoint cho sePay Webhook
// Lưu ý: Endpoint này sePay sẽ gọi trực tiếp, không cần qua protect middleware 
// nhưng nên kiểm tra IP hoặc API Key của sePay gửi kèm để bảo mật.
router.post('/sepay-webhook', sepayWebhook)

export default router
