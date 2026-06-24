import { Request, Response } from 'express'
import Review from '../models/reviewModel'
import Product from '../models/productsModel'
import Order from '../models/orderModel'

// Gửi đánh giá mới
export const createReview = async (req: any, res: Response) => {
    try {
        const { productId, rating, comment } = req.body
        const userId = req.user.id

        // 1. Kiểm tra xem người dùng đã mua sản phẩm này chưa (Tùy chọn - tăng tính xác thực)
        const hasBought = await Order.findOne({
            user: userId,
            'items.product': productId,
            trangThai: 'delivered' // Chỉ cho đánh giá khi đã nhận hàng thành công
        })

        if (!hasBought) {
            res.status(400).json({ message: 'You can review this product only after your order has been delivered.' })
            return
        }

        // 2. Kiểm tra xem đã đánh giá chưa
        const alreadyReviewed = await Review.findOne({ user: userId, product: productId })
        if (alreadyReviewed) {
            res.status(400).json({ message: 'You have already reviewed this product.' })
            return
        }

        // 3. Tạo đánh giá
        const review = await Review.create({
            user: userId,
            product: productId,
            rating,
            comment
        })

        // 4. Tính toán lại đánh giá trung bình của sản phẩm
        const reviews = await Review.find({ product: productId })
        const tongDanhGia = reviews.length
        const danhGiaTB = reviews.reduce((acc, item) => item.rating + acc, 0) / tongDanhGia

        await Product.findByIdAndUpdate(productId, {
            danhGiaTB,
            tongDanhGia
        })

        res.status(201).json({ message: 'Thank you for your review.', review })
    } catch (error) {
        res.status(500).json({ message: 'Server error.', error })
    }
}

// Lấy danh sách đánh giá của một sản phẩm
export const getProductReviews = async (req: Request, res: Response) => {
    try {
        const reviews = await Review.find({ product: req.params.productId })
            .populate('user', 'hoTen')
            .sort({ createdAt: -1 })
        res.json(reviews)
    } catch (error) {
        res.status(500).json({ message: 'Server error.', error })
    }
}
