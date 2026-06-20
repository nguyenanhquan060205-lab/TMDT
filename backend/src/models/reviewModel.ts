import mongoose, { Document, Schema } from 'mongoose'

export interface IReview extends Document {
    user: mongoose.Types.ObjectId
    product: mongoose.Types.ObjectId
    rating: number
    comment: string
}

const ReviewSchema = new Schema<IReview>(
    {
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
        comment: { type: String, required: true },
    },
    { timestamps: true }
)

// Đảm bảo mỗi người dùng chỉ đánh giá một sản phẩm một lần
ReviewSchema.index({ user: 1, product: 1 }, { unique: true })

export default mongoose.model<IReview>('Review', ReviewSchema)
