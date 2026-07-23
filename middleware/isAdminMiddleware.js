
import jwt from "jsonwebtoken"
import { responses } from "../utlies/response.js"

export const isAdmin = async (req, res, next) => {
    try {
        const Headers = req.headers.authorization
        if (!Headers) return responses(res, 401, "Please login")
        const token = Headers.split("Bearer ")[1]

        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        if (![1].includes(Number(decoded.roleId))) return responses(res, 403, "Only admins can access this")
        next();
    } catch (error) {
        return responses(res, 500, "Serverrr error :", error.message)
    }
}
