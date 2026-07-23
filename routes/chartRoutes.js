import { Router } from "express";
import { authorizationFunction } from "../middleware/tokenMiddleware.js";
import { getStockOverview } from "../controllers/chartControllers.js";



const chartRoutes = Router()
chartRoutes.get('/chart', authorizationFunction, getStockOverview)



export default chartRoutes