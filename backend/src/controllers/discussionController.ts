import { Request, Response } from 'express'
import Discussion from '../models/discussionModel'
import Product from '../models/productsModel'

export const createDiscussion = async (req: any, res: Response) => {
    try {
        const { productId, content } = req.body
        const userId = req.user.id
        const trimmedContent = typeof content === 'string' ? content.trim() : ''

        if (!productId || !trimmedContent) {
            res.status(400).json({ message: 'Please enter a discussion message.' })
            return
        }

        const product = await Product.findById(productId)
        if (!product) {
            res.status(404).json({ message: 'Product not found.' })
            return
        }

        const discussion = await Discussion.create({
            user: userId,
            product: productId,
            content: trimmedContent
        })

        await discussion.populate('user', 'hoTen')

        res.status(201).json({ message: 'Discussion posted successfully.', discussion })
    } catch (error) {
        res.status(500).json({ message: 'Server error.', error })
    }
}

export const getProductDiscussions = async (req: Request, res: Response) => {
    try {
        const discussions = await Discussion.find({ product: req.params.productId })
            .populate('user', 'hoTen')
            .sort({ createdAt: -1 })

        res.json(discussions)
    } catch (error) {
        res.status(500).json({ message: 'Server error.', error })
    }
}
