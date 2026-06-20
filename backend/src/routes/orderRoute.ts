import { Router } from 'express'
import { createOrder, getMyOrders, getOrderById, updateOrderStatus, getAllOrders, cancelOrder } from '../controllers/orderController'
import { protect, adminOnly } from '../middlewares/authMiddleware'

const router = Router()

router.use(protect)

// Cho người dùng
router.post('/', createOrder)
router.get('/my-orders', getMyOrders)
router.put('/:id/cancel', cancelOrder)
router.get('/:id', getOrderById)

// Cho Admin
router.get('/admin/all', adminOnly, getAllOrders)
router.put('/admin/status/:id', adminOnly, updateOrderStatus)

export default router
