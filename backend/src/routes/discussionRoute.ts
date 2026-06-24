import { Router } from 'express'
import { createDiscussion, getProductDiscussions } from '../controllers/discussionController'
import { protect } from '../middlewares/authMiddleware'

const router = Router()

router.get('/:productId', getProductDiscussions)
router.post('/', protect, createDiscussion)

export default router
