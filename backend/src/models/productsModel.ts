import mongoose, { Document, Schema } from 'mongoose'

export interface IProduct extends Document {
    tenSP: string
    moTa: string
    gia: number
    soLuong: number
    hinhAnh: string[]
    loai: mongoose.Types.ObjectId
    danhGiaTB: number
    tongDanhGia: number
    trangThai: 'active' | 'inactive'
    giaCu?: number
}

const ProductSchema = new Schema<IProduct>(
    {
        tenSP: { type: String, required: true },
        moTa: { type: String, required: true },
        gia: { type: Number, required: true },
        giaCu: { type: Number },
        soLuong: { type: Number, required: true, default: 0 },
        hinhAnh: [{ type: String }],
        loai: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
        danhGiaTB: { type: Number, default: 0 },
        tongDanhGia: { type: Number, default: 0 },
        trangThai: { type: String, enum: ['active', 'inactive'], default: 'active' },
    },
    { timestamps: true }
)

export default mongoose.model<IProduct>('Product', ProductSchema)