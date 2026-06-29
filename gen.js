const fs = require('fs');
const p = 'backend/src/controllers/authController.ts';
const D = '$';
const B = '`';
let l = [];

l.push("import { Request, Response } from 'express'");
l.push("import bcrypt from 'bcryptjs'");
l.push("import User from '../models/usersModel'");
l.push("import { generateToken } from '../utils/jwt'");
l.push("");

l.push("export const register = async (req: Request, res: Response) => {");
l.push("    try {");
l.push("        const { hoTen, taiKhoan, matKhau, email, sdt } = req.body");
l.push("        const e = await User.findOne({ " + D + "or: [{ taiKhoan }, { email }] })");
l.push("        if (e) { res.status(400).json({ message: 'Tai khoan hoac email da ton tai!' }); return }");
l.push("        const h = await bcrypt.hash(matKhau, 10)");
l.push("        const u = await User.create({ hoTen, taiKhoan, matKhau: h, email, sdt })");
l.push("        res.status(201).json({ message: 'Dang ky thanh cong!', token: generateToken(u._id.toString(), u.vaiTro), user: { id: u._id, hoTen: u.hoTen, taiKhoan: u.taiKhoan, email: u.email, vaiTro: u.vaiTro } })");
l.push("    } catch (e) { console.error('[register] error:', e); res.status(500).json({ message: 'Loi server!', error: e.message }) }");
l.push("}");
l.push("");

l.push("export const login = async (req: Request, res: Response) => {");
l.push("    try {");
l.push("        const { taiKhoan, matKhau } = req.body");
l.push("        const u = await User.findOne({ taiKhoan })");
l.push("        if (!u) { res.status(400).json({ message: 'Tai khoan khong ton tai!' }); return }");
l.push("        if (!(await bcrypt.compare(matKhau, u.matKhau))) { res.status(400).json({ message: 'Mat khau khong dung!' }); return }");
l.push("        res.json({ message: 'Dang nhap thanh cong!', token: generateToken(u._id.toString(), u.vaiTro), user: { id: u._id, hoTen: u.hoTen, taiKhoan: u.taiKhoan, email: u.email, vaiTro: u.vaiTro } })");
l.push("    } catch (e) { console.error('[login] error:', e); res.status(500).json({ message: 'Loi server!', error: e.message }) }");
l.push("}");
l.push("");

l.push("export const googleLogin = async (req, res) => {");
l.push("    try {");
l.push("        const { id_token } = req.body");
l.push("        if (!id_token) { res.status(400).json({ message: 'Thieu id_token!' }); return }");
l.push("        const { OAuth2Client } = require('google-auth-library')");
l.push("        const c = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)");
l.push("        const t = await c.verifyIdToken({ idToken: id_token, audience: process.env.GOOGLE_CLIENT_ID })");
l.push("        const pl = t.getPayload()");
l.push("        if (!pl || !pl.email) { res.status(400).json({ message: 'Token Google khong hop le!' }); return }");
l.push("        const { sub: gId, email, name, picture } = pl");
l.push("        let u = await User.findOne({ " + D + "or: [{ googleId: gId }, { email }] })");
l.push("        if (u) { if (!u.googleId) { u.googleId = gId; u.authProvider = 'local'; await u.save() } }");
l.push("        else { const tk = " + B + "google_" + D + "{gId?.substring(0, 8)}" + B + "; u = await User.create({ hoTen: name || 'Google User', taiKhoan: tk, email, anhDaiDien: picture || 'default.jpg', googleId: gId, authProvider: 'google' }) }");
l.push("        res.json({ message: 'Dang nhap Google thanh cong!', token: generateToken(u._id.toString(), u.vaiTro), user: { id: u._id, hoTen: u.hoTen, taiKhoan: u.taiKhoan, email: u.email, vaiTro: u.vaiTro, anhDaiDien: u.anhDaiDien } })");
l.push("    } catch (e) { console.error('[googleLogin] error:', e); res.status(500).json({ message: 'Loi xac thuc Google!', error: e.message }) }");
l.push("}");
l.push("");

l.push("export const facebookLogin = async (req, res) => {");
l.push("    try {");
l.push("        const { access_token } = req.body");
l.push("        if (!access_token) { res.status(400).json({ message: 'Thieu access_token!' }); return }");
l.push("        const fb = await fetch(" + B + "https://graph.facebook.com/me?fields=id,name,email,picture&access_token=" + D + "{access_token}" + B + ")");
l.push("        const d = await fb.json()");
l.push("        if (!d.id) { res.status(400).json({ message: 'Token Facebook khong hop le!', error: d.error }); return }");
l.push("        const { id: fId, name, email, picture } = d");
l.push("        let u = await User.findOne({ " + D + "or: [{ facebookId: fId }, { email }] })");
l.push("        if (u) { if (!u.facebookId) { u.facebookId = fId; u.authProvider = 'local'; await u.save() } }");
l.push("        else { const tk = " + B + "fb_" + D + "{fId?.substring(0, 8)}" + B + "; const em = email || " + B + D + "{fId}@facebook.com" + B + "; u = await User.create({ hoTen: name || 'Facebook User', taiKhoan: tk, email: em, anhDaiDien: picture?.data?.url || 'default.jpg', facebookId: fId, authProvider: 'facebook' }) }");
l.push("        res.json({ message: 'Dang nhap Facebook thanh cong!', token: generateToken(u._id.toString(), u.vaiTro), user: { id: u._id, hoTen: u.hoTen, taiKhoan: u.taiKhoan, email: u.email, vaiTro: u.vaiTro, anhDaiDien: u.anhDaiDien } })");
l.push("    } catch (e) { console.error('[facebookLogin] error:', e); res.status(500).json({ message: 'Loi xac thuc Facebook!', error: e.message }) }");
l.push("}");
l.push("");

l.push("export const getMe = async (req, res) => {");
l.push("    try { const u = await User.findById(req.user.id).select('-matKhau'); res.json(u) }");
l.push("    catch (e) { res.status(500).json({ message: 'Loi server!', error: e }) }");
l.push("}");

fs.writeFileSync(p, l.join('\n'), 'utf-8');
console.log('Written! ' + l.length + ' lines');

