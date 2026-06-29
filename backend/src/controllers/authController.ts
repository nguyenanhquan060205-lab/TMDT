import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import User from '../models/usersModel'
import { generateToken } from '../utils/jwt'

export const register = async (req: Request, res: Response) => {
    try {
        const { hoTen, taiKhoan, matKhau, email, sdt } = req.body
        const e = await User.findOne({ $or: [{ taiKhoan }, { email }] })
        if (e) { res.status(400).json({ message: 'Tai khoan hoac email da ton tai!' }); return }
        const h = await bcrypt.hash(matKhau, 10)
        const u = await User.create({ hoTen, taiKhoan, matKhau: h, email, sdt })
        res.status(201).json({ message: 'Dang ky thanh cong!', token: generateToken(u._id.toString(), u.vaiTro), user: { id: u._id, hoTen: u.hoTen, taiKhoan: u.taiKhoan, email: u.email, vaiTro: u.vaiTro } })
    } catch (e) { console.error('[register] error:', e); res.status(500).json({ message: 'Loi server!', error: e.message }) }
}

export const login = async (req: Request, res: Response) => {
    try {
        const { taiKhoan, matKhau } = req.body
        const u = await User.findOne({ taiKhoan })
        if (!u) { res.status(400).json({ message: 'Tai khoan khong ton tai!' }); return }
        if (!(await bcrypt.compare(matKhau, u.matKhau))) { res.status(400).json({ message: 'Mat khau khong dung!' }); return }
        res.json({ message: 'Dang nhap thanh cong!', token: generateToken(u._id.toString(), u.vaiTro), user: { id: u._id, hoTen: u.hoTen, taiKhoan: u.taiKhoan, email: u.email, vaiTro: u.vaiTro } })
    } catch (e) { console.error('[login] error:', e); res.status(500).json({ message: 'Loi server!', error: e.message }) }
}

export const googleLogin = async (req, res) => {
    try {
        const { id_token } = req.body
        if (!id_token) { res.status(400).json({ message: 'Thieu id_token!' }); return }
        const { OAuth2Client } = require('google-auth-library')
        const c = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)
        const t = await c.verifyIdToken({ idToken: id_token, audience: process.env.GOOGLE_CLIENT_ID })
        const pl = t.getPayload()
        if (!pl || !pl.email) { res.status(400).json({ message: 'Token Google khong hop le!' }); return }
        const { sub: gId, email, name, picture } = pl
        let u = await User.findOne({ $or: [{ googleId: gId }, { email }] })
        if (u) { if (!u.googleId) { u.googleId = gId; u.authProvider = 'local'; await u.save() } }
        else { const tk = `google_${gId?.substring(0, 8)}`; u = await User.create({ hoTen: name || 'Google User', taiKhoan: tk, email, anhDaiDien: picture || 'default.jpg', googleId: gId, authProvider: 'google' }) }
        res.json({ message: 'Dang nhap Google thanh cong!', token: generateToken(u._id.toString(), u.vaiTro), user: { id: u._id, hoTen: u.hoTen, taiKhoan: u.taiKhoan, email: u.email, vaiTro: u.vaiTro, anhDaiDien: u.anhDaiDien } })
    } catch (e) { console.error('[googleLogin] error:', e); res.status(500).json({ message: 'Loi xac thuc Google!', error: e.message }) }
}

export const facebookLogin = async (req, res) => {
    try {
        const { access_token } = req.body
        if (!access_token) { res.status(400).json({ message: 'Thieu access_token!' }); return }
        const fb = await fetch(`https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${access_token}`)
        const d = await fb.json()
        if (!d.id) { res.status(400).json({ message: 'Token Facebook khong hop le!', error: d.error }); return }
        const { id: fId, name, email, picture } = d
        let u = await User.findOne({ $or: [{ facebookId: fId }, { email }] })
        if (u) { if (!u.facebookId) { u.facebookId = fId; u.authProvider = 'local'; await u.save() } }
        else { const tk = `fb_${fId?.substring(0, 8)}`; const em = email || `${fId}@facebook.com`; u = await User.create({ hoTen: name || 'Facebook User', taiKhoan: tk, email: em, anhDaiDien: picture?.data?.url || 'default.jpg', facebookId: fId, authProvider: 'facebook' }) }
        res.json({ message: 'Dang nhap Facebook thanh cong!', token: generateToken(u._id.toString(), u.vaiTro), user: { id: u._id, hoTen: u.hoTen, taiKhoan: u.taiKhoan, email: u.email, vaiTro: u.vaiTro, anhDaiDien: u.anhDaiDien } })
    } catch (e) { console.error('[facebookLogin] error:', e); res.status(500).json({ message: 'Loi xac thuc Facebook!', error: e.message }) }
}

export const getMe = async (req, res) => {
    try { const u = await User.findById(req.user.id).select('-matKhau'); res.json(u) }
    catch (e) { res.status(500).json({ message: 'Loi server!', error: e }) }
}