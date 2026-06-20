import jwt from 'jsonwebtoken'

export const generateToken = (id: string, vaiTro: string) => {
    const JWT_SECRET = process.env.JWT_SECRET as string
    return jwt.sign({ id, vaiTro }, JWT_SECRET, { expiresIn: '7d' })
}

export const verifyToken = (token: string) => {
    const JWT_SECRET = process.env.JWT_SECRET as string
    return jwt.verify(token, JWT_SECRET)
}