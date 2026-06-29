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
        