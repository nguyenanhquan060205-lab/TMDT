import { Request, Response } from 'express'
import Product from '../models/productsModel'

export const getProducts = async (req: Request, res: Response) => {
    try {
        const { category, search, minPrice, maxPrice, isDeal, status } = req.query
        let query: any = {}

        // Mặc định lọc theo trạng thái 'active', ngoại trừ khi status = 'all'
        if (status === 'all') {
            // Không lọc trạng thái (cho admin xem cả ngừng bán)
        } else if (status) {
            query.trangThai = status
        } else {
            query.trangThai = 'active'
        }

        // Lọc theo danh mục nếu có
        if (category) {
            query.loai = category
        }

        // Tìm kiếm theo tên nếu có (không phân biệt hoa thường)
        if (search) {
            query.tenSP = { $regex: search, $options: 'i' }
        }

        // Lọc theo khoảng giá
        if (minPrice || maxPrice) {
            query.gia = {}
            if (minPrice) query.gia.$gte = Number(minPrice)
            if (maxPrice) query.gia.$lte = Number(maxPrice)
        }

        // Lọc sản phẩm khuyến mãi (Deals)
        if (isDeal === 'true') {
            query.giaCu = { $exists: true, $gt: 0 }
            // Chỉ lấy các sản phẩm mà giaCu lớn hơn gia thực tế
            query.$expr = { $gt: ['$giaCu', '$gia'] }
        }

        const products = await Product.find(query).populate('loai', 'tenDM')
        res.json(products)
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server!', error })
    }
}

export const getProductById = async (req: Request, res: Response) => {
    try {
        const product = await Product.findById(req.params.id).populate('loai', 'tenDM')
        if (!product) {
            res.status(404).json({ message: 'Không tìm thấy sản phẩm!' })
            return
        }
        res.json(product)
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server!', error })
    }
}

export const createProduct = async (req: Request, res: Response) => {
    try {
        const product = await Product.create(req.body)
        res.status(201).json(product)
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server!', error })
    }
}

export const updateProduct = async (req: Request, res: Response) => {
    try {
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true })
        if (!product) {
            res.status(404).json({ message: 'Không tìm thấy sản phẩm!' })
            return
        }
        res.json(product)
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server!', error })
    }
}

export const deleteProduct = async (req: Request, res: Response) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id)
        if (!product) {
            res.status(404).json({ message: 'Không tìm thấy sản phẩm!' })
            return
        }
        res.json({ message: 'Xóa sản phẩm thành công!' })
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server!', error })
    }
}
