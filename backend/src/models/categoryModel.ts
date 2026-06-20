import mongoose, { Document, Schema } from 'mongoose'

export interface ICategory extends Document {
    tenDM: string
    moTa?: string
}

const CategorySchema = new Schema<ICategory>(
    {
        tenDM: { type: String, required: true, unique: true },
        moTa: { type: String },
    },
    { timestamps: true }
)

export default mongoose.model<ICategory>('Category', CategorySchema)
