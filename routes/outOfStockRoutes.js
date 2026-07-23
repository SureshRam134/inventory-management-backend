import { Router } from "express"
import { getAllOutOfStock } from "../controllers/outOfStockController.js";
import { authorizationFunction } from "../middleware/tokenMiddleware.js";


const outOfStockRoutes = Router();
outOfStockRoutes.get('/all', authorizationFunction, getAllOutOfStock)


export default outOfStockRoutes;