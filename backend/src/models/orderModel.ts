import mongoose, { Document, Schema } from 'mongoose'

export interface IOrderItem {
    product: mongoose.Types.ObjectId
    quantity: number
    price: number
}

export interface IOrder extends Document {
    user: mongoose.Types.ObjectId
    items: IOrderItem[]
    tongTien: number
    diaChiGiaoHang: string
    sdtNhanHang: string
    ghiChu?: string
    trangThai: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
    phuongThucThanhToan: 'COD' | 'banking'
    trangThaiThanhToan: 'unpaid' | 'paid' | 'failed'
    maGiaoDich?: string // Dùng để lưu mã giao dịch từ sePay
    maGiamGia?: string
    soTienGiam?: number
}

const OrderSchema = new Schema<IOrder>(
    {
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        items: [
            {
                product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
                quantity: { type: Number, required: true },
                price: { type: Number, required: true },
            },
        ],
        tongTien: { type: Number, required: true },
        diaChiGiaoHang: { type: String, required: true },
        sdtNhanHang: { type: String, required: true },
        ghiChu: { type: String },
        trangThai: {
            type: String,
            enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
            default: 'pending',
        },
        phuongThucThanhToan: {
            type: String,
            enum: ['COD', 'banking'],
            default: 'COD',
        },
        trangThaiThanhToan: {
            type: String,
            enum: ['unpaid', 'paid', 'failed'],
            default: 'unpaid',
        },
        maGiaoDich: { type: String },
        maGiamGia: { type: String },
        soTienGiam: { type: Number, default: 0 },
    },
    { timestamps: true }
)

export default mongoose.model<IOrder>('Order', OrderSchema)
