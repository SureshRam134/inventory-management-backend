
import jwt from "jsonwebtoken"
import { responses } from "../utlies/response.js"

export const authorizationFunction = async (req, res, next) => {
    const Headers = req.headers.authorization
    if (!Headers) return responses(res, 401, "Token not found")
    const token = Headers.split("Bearer ")[1]
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXP })
        req.user = {
            id: decoded.id,
            role: decoded.role,
        };
        next();
    } catch (error) {
        return responses(res, 500, "server error", error.message)
    }
}