import { Request, Response } from 'express'
import Cart from '../models/cartModel'
import Product from '../models/productsModel'

// Lấy giỏ hàng của người dùng hiện tại
export const getCart = async (req: any, res: Response) => {
    try {
        let cart = await Cart.findOne({ user: req.user.id }).populate('items.product', 'tenSP gia hinhAnh')
        
        if (!cart) {
            cart = await Cart.create({ user: req.user.id, items: [] })
        }
        
        res.json(cart)
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server!', error })
    }
}

// Thêm sản phẩm vào giỏ hàng
export const addToCart = async (req: any, res: Response) => {
    try {
        const { productId, quantity } = req.body
        
        // Kiểm tra sản phẩm tồn tại
        const product = await Product.findById(productId)
        if (!product) {
            res.status(404).json({ message: 'Sản phẩm không tồn tại!' })
            return
        }

        let cart = await Cart.findOne({ user: req.user.id })
        const reqQty = quantity || 1

        if (!cart) {
            // Kiểm tra số lượng tồn kho
            if (reqQty > product.soLuong) {
                res.status(400).json({ message: `Số lượng yêu cầu (${reqQty}) vượt quá tồn kho hiện tại của sản phẩm (${product.soLuong})!` })
                return
            }
            // Nếu chưa có giỏ hàng thì tạo mới
            cart = await Cart.create({
                user: req.user.id,
                items: [{ product: productId, quantity: reqQty }]
            })
        } else {
            // Nếu đã có giỏ hàng, kiểm tra sản phẩm đã có trong giỏ chưa
            const itemIndex = cart.items.findIndex(item => item.product.toString() === productId)

            if (itemIndex > -1) {
                // Tính tổng số lượng mới sau khi cộng thêm
                const newQty = cart.items[itemIndex].quantity + reqQty
                if (newQty > product.soLuong) {
                    res.status(400).json({ message: `Không thể thêm! Tổng số lượng trong giỏ (${newQty}) sẽ vượt quá tồn kho hiện tại (${product.soLuong})!` })
                    return
                }
                cart.items[itemIndex].quantity = newQty
            } else {
                if (reqQty > product.soLuong) {
                    res.status(400).json({ message: `Số lượng yêu cầu (${reqQty}) vượt quá tồn kho hiện tại của sản phẩm (${product.soLuong})!` })
                    return
                }
                // Nếu chưa có thì thêm mới vào mảng items
                cart.items.push({ product: productId as any, quantity: reqQty })
            }
            await cart.save()
        }

        res.status(200).json(cart)
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server!', error })
    }
}

// Cập nhật số lượng sản phẩm trong giỏ
export const updateCartItem = async (req: any, res: Response) => {
    try {
        const { productId, quantity } = req.body
        const cart = await Cart.findOne({ user: req.user.id })

        if (!cart) {
            res.status(404).json({ message: 'Không tìm thấy giỏ hàng!' })
            return
        }

        const itemIndex = cart.items.findIndex(item => item.product.toString() === productId)
        if (itemIndex > -1) {
            if (quantity <= 0) {
                cart.items.splice(itemIndex, 1) // Xóa nếu số lượng <= 0
            } else {
                // Kiểm tra số lượng tồn kho của sản phẩm
                const product = await Product.findById(productId)
                if (!product) {
                    res.status(404).json({ message: 'Sản phẩm không tồn tại!' })
                    return
                }
                if (quantity > product.soLuong) {
                    res.status(400).json({ message: `Số lượng cập nhật (${quantity}) vượt quá tồn kho hiện tại của sản phẩm (${product.soLuong})!` })
                    return
                }
                cart.items[itemIndex].quantity = quantity
            }
            await cart.save()
            res.json(cart)
        } else {
            res.status(404).json({ message: 'Sản phẩm không có trong giỏ hàng!' })
        }
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server!', error })
    }
}

// Xóa một sản phẩm khỏi giỏ hàng
export const removeFromCart = async (req: any, res: Response) => {
    try {
        const { productId } = req.params
        const cart = await Cart.findOne({ user: req.user.id })

        if (!cart) {
            res.status(404).json({ message: 'Không tìm thấy giỏ hàng!' })
            return
        }

        cart.items = cart.items.filter(item => item.product.toString() !== productId)
        await cart.save()
        res.json(cart)
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server!', error })
    }
}

// Xóa sạch giỏ hàng
export const clearCart = async (req: any, res: Response) => {
    try {
        const cart = await Cart.findOne({ user: req.user.id })
        if (cart) {
            cart.items = []
            await cart.save()
        }
        res.json({ message: 'Giỏ hàng đã được làm trống!' })
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server!', error })
    }
}
