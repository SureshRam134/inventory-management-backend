import { Router } from "express";
import { authorizationFunction } from "../middleware/tokenMiddleware.js";
import { getAllStockOut } from "../controllers/stockOutControllers.js";


const stockOutRoutes = Router()
stockOutRoutes.get('/all', authorizationFunction ,getAllStockOut)

export default stockOutRoutes