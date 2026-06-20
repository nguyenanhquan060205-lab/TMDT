import { Request, Response } from 'express'
import Order from '../models/orderModel'

/**
 * Webhook nhận thông báo thanh toán từ sePay
 * sePay sẽ gửi POST request tới endpoint này mỗi khi có biến động số dư
 */
export const sepayWebhook = async (req: Request, res: Response) => {
    try {
        // sePay gửi dữ liệu trong body
        const { content, transferAmount, id: transactionId, transferType } = req.body

        console.log('Nhận thông báo thanh toán từ sePay:', req.body)

        // Chỉ xử lý giao dịch tiền vào (in)
        if (transferType !== 'in') {
            res.json({ success: true, message: 'Không phải giao dịch nạp tiền' })
            return
        }

        /**
         * Giả sử nội dung chuyển khoản có dạng: "DH65f123456789..." 
         * Chúng ta sẽ trích xuất mã đơn hàng từ nội dung này.
         * Bạn có thể quy định nội dung chuyển khoản là "DH" + mã đơn hàng.
         */
        const orderIdMatch = content.match(/DH([a-fA-F0-9]{24})/)
        if (!orderIdMatch) {
            res.json({ success: true, message: 'Nội dung chuyển khoản không chứa mã đơn hàng hợp lệ' })
            return
        }

        const orderId = orderIdMatch[1]
        const order = await Order.findById(orderId)

        if (!order) {
            res.json({ success: true, message: 'Không tìm thấy đơn hàng' })
            return
        }

        // Kiểm tra số tiền (Tùy chọn: có thể cho phép thanh toán thiếu hoặc dư tùy logic)
        if (transferAmount < order.tongTien) {
            console.warn(`Đơn hàng ${orderId} thanh toán thiếu: Cần ${order.tongTien}, nhận ${transferAmount}`)
            // Có thể cập nhật trạng thái là "thanh toán một phần" nếu muốn
        }

        // Cập nhật trạng thái đơn hàng
        order.trangThaiThanhToan = 'paid'
        order.maGiaoDich = transactionId.toString()
        order.trangThai = 'processing' // Chuyển sang trạng thái đang xử lý sau khi thanh toán
        await order.save()

        console.log(`Đơn hàng ${orderId} đã được thanh toán thành công qua sePay.`)

        // Phản hồi cho sePay rằng đã nhận được thông tin
        res.json({ success: true, message: 'Xác nhận thanh toán thành công' })
    } catch (error) {
        console.error('Lỗi xử lý sePay Webhook:', error)
        res.status(500).json({ success: false, message: 'Lỗi server' })
    }
}
