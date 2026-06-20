import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import User from '../models/usersModel'
import { generateToken } from '../utils/jwt'

export const register = async (req: Request, res: Response) => {
    try {
        const { hoTen, taiKhoan, matKhau, email, sdt } = req.body

        const userExists = await User.findOne({ $or: [{ taiKhoan }, { email }] })
        if (userExists) {
            res.status(400).json({ message: 'Tài khoản hoặc email đã tồn tại!' })
            return
        }

        const hashedPassword = await bcrypt.hash(matKhau, 10)

        const user = await User.create({
            hoTen,
            taiKhoan,
            matKhau: hashedPassword,
            email,
            sdt,
        })

        res.status(201).json({
            message: 'Đăng ký thành công!',
            token: generateToken(user._id.toString(), user.vaiTro),
            user: {
                id: user._id,
                hoTen: user.hoTen,
                taiKhoan: user.taiKhoan,
                email: user.email,
                vaiTro: user.vaiTro,
            },
        })
    } catch (error) {
        console.error('[register] error:', error)
        res.status(500).json({ message: 'Lỗi server!', error: (error as Error).message })
    }
}

export const login = async (req: Request, res: Response) => {
    try {
        const { taiKhoan, matKhau } = req.body

        const user = await User.findOne({ taiKhoan })
        if (!user) {
            res.status(400).json({ message: 'Tài khoản không tồn tại!' })
            return
        }

        const isMatch = await bcrypt.compare(matKhau, user.matKhau)
        if (!isMatch) {
            res.status(400).json({ message: 'Mật khẩu không đúng!' })
            return
        }

        res.json({
            message: 'Đăng nhập thành công!',
            token: generateToken(user._id.toString(), user.vaiTro),
            user: {
                id: user._id,
                hoTen: user.hoTen,
                taiKhoan: user.taiKhoan,
                email: user.email,
                vaiTro: user.vaiTro,
            },
        })
    } catch (error) {
        console.error('[login] error:', error)
        res.status(500).json({ message: 'Lỗi server!', error: (error as Error).message })
    }
}

export const getMe = async (req: any, res: Response) => {
    try {
        const user = await User.findById(req.user.id).select('-matKhau')
        res.json(user)
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server!', error })
    }
}