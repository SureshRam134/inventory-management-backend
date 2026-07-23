import { Router } from "express";
import { authorizationFunction } from "../middleware/tokenMiddleware.js";
import { addStockIn, getAllStockIn, getProduct, getSupplier , softUpdateStockIn} from "../controllers/stockInControllers.js";
import { isAdmin } from "../middleware/isAdminMiddleware.js";


const stockInRoutes = Router()
stockInRoutes.get('/all', authorizationFunction, getAllStockIn)
stockInRoutes.get('/product', authorizationFunction, getProduct)
stockInRoutes.get('/supplier', authorizationFunction, getSupplier)
stockInRoutes.post('/add',authorizationFunction, isAdmin, addStockIn)
stockInRoutes.patch('/softupdate/:id',authorizationFunction, isAdmin, softUpdateStockIn)

export default stockInRoutes