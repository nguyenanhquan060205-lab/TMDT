import mongoose, { Document, Schema } from 'mongoose'

export interface IUser extends Document {
    hoTen: string
    taiKhoan: string
    matKhau?: string
    email: string
    sdt?: string
    diaChi?: string
    anhDaiDien?: string
    vaiTro: 'user' | 'admin'
    googleId?: string
    facebookId?: string
    authProvider: 'local' | 'google' | 'facebook'
    ngayTao: Date
}

const UserSchema = new Schema<IUser>(
    {
        hoTen: { type: String, required: true },
        taiKhoan: { type: String, required: true, unique: true },
        matKhau: { type: String, required: false },
        email: { type: String, required: true, unique: true },
        sdt: { type: String },
        diaChi: { type: String },
        anhDaiDien: { type: String, default: 'default.jpg' },
        vaiTro: { type: String, enum: ['user', 'admin'], default: 'user' },
        googleId: { type: String, sparse: true },
        facebookId: { type: String, sparse: true },
        authProvider: { type: String, enum: ['local', 'google', 'facebook'], default: 'local' },
    },
    { timestamps: true }
)

export default mongoose.model<IUser>('User', UserSchema)
