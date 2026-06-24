import mongoose, { Document, Schema } from 'mongoose'

export interface IDiscussion extends Document {
    user: mongoose.Types.ObjectId
    product: mongoose.Types.ObjectId
    content: string
}

const DiscussionSchema = new Schema<IDiscussion>(
    {
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        content: { type: String, required: true, trim: true, minlength: 1, maxlength: 1000 },
    },
    { timestamps: true }
)

DiscussionSchema.index({ product: 1, createdAt: -1 })

export default mongoose.model<IDiscussion>('Discussion', DiscussionSchema)
