import express, { Request, Response, NextFunction } from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoute from './routes/authRoute'
import categoryRoute from './routes/categoryRoute'
import productRoute from './routes/productRoute'
import cartRoute from './routes/cartRoute'
import orderRoute from './routes/orderRoute'
import reviewRoute from './routes/reviewRoute'
import paymentRoute from './routes/paymentRoute'

dotenv.config({ override: true })

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Routes
app.use('/api/auth', authRoute)
app.use('/api/categories', categoryRoute)
app.use('/api/products', productRoute)
app.use('/api/cart', cartRoute)
app.use('/api/orders', orderRoute)
app.use('/api/reviews', reviewRoute)
app.use('/api/payments', paymentRoute)

app.get('/', (req: Request, res: Response) => {
    res.json({ message: 'Server đang chạy!' })
})

// Global error handler cho Express 5 (bắt lỗi từ async routes)
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('[Global Error]', err)
    res.status(err.status || 500).json({
        message: err.message || 'Lỗi server!',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    })
})

mongoose
    .connect(process.env.MONGODB_URI as string)
    .then(() => {
        console.log('Kết nối MongoDB thành công!')
        app.listen(PORT, () => {
            console.log(`Server đang chạy tại http://localhost:${PORT}`)
        })
    })
    .catch((err) => {
        console.log('Kết nối MongoDB thất bại:', err)
    })