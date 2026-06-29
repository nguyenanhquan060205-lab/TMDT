import { Router } from 'express'
import { register, login, googleLogin, facebookLogin, getMe } from '../controllers/authController'
import { protect } from '../middlewares/authMiddleware'

const router = Router()

router.post('/register', register)
router.post('/login', login)
router.post('/google', googleLogin)
router.post('/facebook', facebookLogin)
router.get('/me', protect, getMe)

export default router
