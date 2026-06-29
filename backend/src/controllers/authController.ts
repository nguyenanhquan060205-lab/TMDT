import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import User from '../models/usersModel'
import { generateToken } from '../utils/jwt'

export const register = async (req: Request, res: Response) => {
    try {
        const { hoTen, taiKhoan, matKhau, email, sdt } = req.body
        const existingUser = await User.findOne({ $or: [{ taiKhoan }, { email }] })
        if (existingUser) { res.status(400).json({ message: 'Tai khoan hoac email da ton tai!' }); return }
        const h = await bcrypt.hash(matKhau, 10)
        const user = await User.create({ hoTen, taiKhoan, matKhau: h, email, sdt })
        res.status(201).json({ message: 'Dang ky thanh cong!', token: generateToken(user._id.toString(), user.vaiTro), user: { id: user._id, hoTen: user.hoTen, taiKhoan: user.taiKhoan, email: user.email, vaiTro: user.vaiTro } })
    } catch (error: unknown) { console.error('[register] error:', error); res.status(500).json({ message: 'Loi server!', error: (error as Error).message }) }
}

export const login = async (req: Request, res: Response) => {
    try {
        const { taiKhoan, matKhau } = req.body
        const user = await User.findOne({ taiKhoan })
        if (!user) { res.status(400).json({ message: 'Tai khoan khong ton tai!' }); return }
        if (!(await bcrypt.compare(matKhau, user!.matKhau))) { res.status(400).json({ message: 'Mat khau khong dung!' }); return }
        res.json({ message: 'Dang nhap thanh cong!', token: generateToken(user._id.toString(), user.vaiTro), user: { id: user._id, hoTen: user.hoTen, taiKhoan: user.taiKhoan, email: user.email, vaiTro: user.vaiTro } })
    } catch (error: unknown) { console.error('[login] error:', error); res.status(500).json({ message: 'Loi server!', error: (error as Error).message }) }
}

export const googleLogin = async (req: Request, res: Response) => {
    try {
        const { id_token } = req.body
        if (!id_token) { res.status(400).json({ message: 'Thieu id_token!' }); return }
        const { OAuth2Client } = require('google-auth-library')
        const c = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)
        const t = await c.verifyIdToken({ idToken: id_token, audience: process.env.GOOGLE_CLIENT_ID })
        const pl = t.getPayload()
        if (!pl || !pl.email) { res.status(400).json({ message: 'Token Google khong hop le!' }); return }
        const { sub: gId, email, name, picture } = pl
        let user = await User.findOne({ $or: [{ googleId: gId }, { email }] })
        if (user) { if (!user.googleId) { user.googleId = gId; user.authProvider = 'local'; await user.save() } }
        else { const tk = `google_${gId?.substring(0, 8)}`; user = await User.create({ hoTen: name || 'Google User', taiKhoan: tk, email, anhDaiDien: picture || 'default.jpg', googleId: gId, authProvider: 'google' }) }
        res.json({ message: 'Dang nhap Google thanh cong!', token: generateToken(user._id.toString(), user.vaiTro), user: { id: user._id, hoTen: user.hoTen, taiKhoan: user.taiKhoan, email: user.email, vaiTro: user.vaiTro, anhDaiDien: user.anhDaiDien } })
    } catch (error: unknown) { console.error('[googleLogin] error:', error); res.status(500).json({ message: 'Loi xac thuc Google!', error: (error as Error).message }) }
}

export const facebookLogin = async (req: Request, res: Response) => {
    try {
        const { access_token } = req.body
        if (!access_token) { res.status(400).json({ message: 'Thieu access_token!' }); return }
        const fb = await fetch(`https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${access_token}`)
        const d = (await fb.json()) as any
        if (!d.id) { res.status(400).json({ message: 'Token Facebook khong hop le!', error: d.error }); return }
        const { id: fId, name, email, picture } = d
        let user = await User.findOne({ $or: [{ facebookId: fId }, { email }] })
        if (user) { if (!user.facebookId) { user.facebookId = fId; user.authProvider = 'local'; await user.save() } }
        else { const tk = `fb_${fId?.substring(0, 8)}`; const em = email || `${fId}@facebook.com`; user = await User.create({ hoTen: name || 'Facebook User', taiKhoan: tk, email: em, anhDaiDien: picture?.data?.url || 'default.jpg', facebookId: fId, authProvider: 'facebook' }) }
        res.json({ message: 'Dang nhap Facebook thanh cong!', token: generateToken(user._id.toString(), user.vaiTro), user: { id: user._id, hoTen: user.hoTen, taiKhoan: user.taiKhoan, email: user.email, vaiTro: user.vaiTro, anhDaiDien: user.anhDaiDien } })
    } catch (error: unknown) { console.error('[facebookLogin] error:', error); res.status(500).json({ message: 'Loi xac thuc Facebook!', error: (error as Error).message }) }
}

export const getMe = async (req: Request, res: Response) => {
    try { const user = await User.findById(req.user.id).select('-matKhau'); res.json(user) }
    catch (error: unknown) { res.status(500).json({ message: 'Loi server!', error: (error as Error).message }) }
}