import { Request, Response, NextFunction } from 'express'
import { verifyToken } from '../utils/jwt'

export interface AuthRequest extends Request {
    user?: any
}

export const protect = (req: AuthRequest, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1]

    if (!token) {
        res.status(401).json({ message: 'Không có token, từ chối truy cập!' })
        return
    }

    try {
        const decoded = verifyToken(token)
        req.user = decoded
        next()
    } catch (error) {
        res.status(401).json({ message: 'Token không hợp lệ!' })
    }
}

export const adminOnly = (req: AuthRequest, res: Response, next: NextFunction) => {
    if (req.user?.vaiTro !== 'admin') {
        res.status(403).json({ message: 'Chỉ admin mới có quyền truy cập!' })
        return
    }
    next()
}