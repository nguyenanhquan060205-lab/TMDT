import { Request, Response } from 'express'
import Order from '../models/orderModel'
import Cart from '../models/cartModel'
import Product from '../models/productsModel'

// Tạo đơn hàng mới từ giỏ hàng
export const createOrder = async (req: any, res: Response) => {
    try {
        const { diaChiGiaoHang, sdtNhanHang, ghiChu, phuongThucThanhToan, maGiamGia } = req.body

        // 1. Lấy giỏ hàng của người dùng
        const cart = await Cart.findOne({ user: req.user.id }).populate('items.product')
        if (!cart || cart.items.length === 0) {
            res.status(400).json({ message: 'Giỏ hàng trống, không thể tạo đơn hàng!' })
            return
        }

        // 1.5. Kiểm tra hàng tồn kho trước khi đặt hàng
        for (const item of cart.items) {
            const product = item.product as any
            if (!product) {
                res.status(400).json({ message: 'Có sản phẩm không tồn tại trong giỏ hàng!' })
                return
            }
            if (product.soLuong < item.quantity) {
                res.status(400).json({ message: `Sản phẩm "${product.tenSP}" không đủ hàng trong kho (Còn: ${product.soLuong}, yêu cầu: ${item.quantity})!` })
                return
            }
        }

        // 2. Tính tổng tiền và chuẩn bị danh sách sản phẩm cho đơn hàng
        let tongTien = 0
        const itemsOrder = cart.items.map((item: any) => {
            const price = item.product.gia
            const subtotal = price * item.quantity
            tongTien += subtotal
            return {
                product: item.product._id,
                quantity: item.quantity,
                price: price
            }
        })

        // Tính toán giảm giá từ Promo Code
        let soTienGiam = 0
        if (maGiamGia === 'HUIT10') {
            soTienGiam = Math.round(tongTien * 0.1)
        } else if (maGiamGia === 'HUIT20') {
            soTienGiam = Math.round(tongTien * 0.2)
        }
        const tongTienSauGiam = tongTien - soTienGiam

        // 3. Tạo đơn hàng
        const order = await Order.create({
            user: req.user.id,
            items: itemsOrder,
            tongTien: tongTienSauGiam,
            diaChiGiaoHang,
            sdtNhanHang,
            ghiChu,
            phuongThucThanhToan: phuongThucThanhToan || 'COD',
            maGiamGia,
            soTienGiam
        })

        // 4. Cập nhật số lượng tồn kho của sản phẩm
        for (const item of cart.items) {
            await Product.findByIdAndUpdate(item.product._id, {
                $inc: { soLuong: -item.quantity }
            })
        }

        // 5. Làm trống giỏ hàng sau khi đặt hàng thành công
        cart.items = []
        await cart.save()

        res.status(201).json({
            message: 'Đặt hàng thành công!',
            order
        })
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server!', error })
    }
}

// Lấy danh sách đơn hàng của người dùng hiện tại
export const getMyOrders = async (req: any, res: Response) => {
    try {
        const orders = await Order.find({ user: req.user.id })
            .populate('items.product', 'tenSP hinhAnh')
            .sort({ createdAt: -1 })
        res.json(orders)
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server!', error })
    }
}

// Lấy chi tiết một đơn hàng
export const getOrderById = async (req: any, res: Response) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('user', 'hoTen email')
            .populate('items.product', 'tenSP gia hinhAnh')
        
        if (!order) {
            res.status(404).json({ message: 'Không tìm thấy đơn hàng!' })
            return
        }

        // Kiểm tra quyền: chỉ chủ đơn hàng hoặc admin mới được xem
        if (order.user._id.toString() !== req.user.id && req.user.vaiTro !== 'admin') {
            res.status(403).json({ message: 'Bạn không có quyền xem đơn hàng này!' })
            return
        }

        res.json(order)
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server!', error })
    }
}

// Cập nhật trạng thái đơn hàng (Dành cho Admin)
export const updateOrderStatus = async (req: any, res: Response) => {
    try {
        const { trangThai, trangThaiThanhToan } = req.body
        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { trangThai, trangThaiThanhToan },
            { new: true }
        )
        
        if (!order) {
            res.status(404).json({ message: 'Không tìm thấy đơn hàng!' })
            return
        }

        res.json({ message: 'Cập nhật trạng thái thành công!', order })
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server!', error })
    }
}

// Lấy toàn bộ đơn hàng (Dành cho Admin)
export const getAllOrders = async (req: Request, res: Response) => {
    try {
        const orders = await Order.find()
            .populate('user', 'hoTen taiKhoan')
            .sort({ createdAt: -1 })
        res.json(orders)
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server!', error })
    }
}

// Hủy đơn hàng dành cho Người dùng
export const cancelOrder = async (req: any, res: Response) => {
    try {
        const order = await Order.findById(req.params.id)
        if (!order) {
            res.status(404).json({ message: 'Không tìm thấy đơn hàng!' })
            return
        }

        // Kiểm tra quyền: chỉ chủ đơn hàng mới được hủy
        if (order.user.toString() !== req.user.id) {
            res.status(403).json({ message: 'Bạn không có quyền hủy đơn hàng này!' })
            return
        }

        // Chỉ cho phép hủy khi trạng thái là pending
        if (order.trangThai !== 'pending') {
            res.status(400).json({ message: `Không thể hủy đơn hàng đang ở trạng thái: ${order.trangThai}!` })
            return
        }

        // Cập nhật trạng thái hủy
        order.trangThai = 'cancelled'
        await order.save()

        // Hoàn trả lại số lượng tồn kho cho sản phẩm
        for (const item of order.items) {
            await Product.findByIdAndUpdate(item.product, {
                $inc: { soLuong: item.quantity }
            })
        }

        res.json({ message: 'Hủy đơn hàng thành công!', order })
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server!', error })
    }
}
