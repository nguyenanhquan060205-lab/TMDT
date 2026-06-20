import { Request, Response } from 'express'
import Category from '../models/categoryModel'

export const getCategories = async (req: Request, res: Response) => {
    try {
        const categories = await Category.find()
        res.json(categories)
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server!', error })
    }
}

export const createCategory = async (req: Request, res: Response) => {
    try {
        const { tenDM, moTa } = req.body
        const categoryExists = await Category.findOne({ tenDM })
        if (categoryExists) {
            res.status(400).json({ message: 'Danh mục đã tồn tại!' })
            return
        }
        const category = await Category.create({ tenDM, moTa })
        res.status(201).json(category)
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server!', error })
    }
}

export const updateCategory = async (req: Request, res: Response) => {
    try {
        const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true })
        if (!category) {
            res.status(404).json({ message: 'Không tìm thấy danh mục!' })
            return
        }
        res.json(category)
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server!', error })
    }
}

export const deleteCategory = async (req: Request, res: Response) => {
    try {
        const category = await Category.findByIdAndDelete(req.params.id)
        if (!category) {
            res.status(404).json({ message: 'Không tìm thấy danh mục!' })
            return
        }
        res.json({ message: 'Xóa danh mục thành công!' })
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server!', error })
    }
}
