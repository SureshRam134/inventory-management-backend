import { Router } from "express"
import { isAdmin } from "../middleware/isAdminMiddleware.js";
import upload from "../middleware/upload.js";
import { getAllOrders, softUpdateOrders, uploadOrders, deleteOrders, getOderCount, returnOrder, cancelOrder,getReturnCount, getCancelledCount  } from "../controllers/ordersControllers.js";
import { authorizationFunction } from "../middleware/tokenMiddleware.js";

const ordersRoutes = Router()
ordersRoutes.post("/upload",authorizationFunction, upload.single("file"), uploadOrders)
ordersRoutes.get('/all', authorizationFunction, getAllOrders)
ordersRoutes.get('/count', authorizationFunction, getOderCount)
ordersRoutes.get('/return/count', authorizationFunction, getReturnCount)
ordersRoutes.get('/cancelled/count', authorizationFunction, getCancelledCount)
ordersRoutes.patch('/softUpdate/:id', authorizationFunction, softUpdateOrders)
ordersRoutes.patch('/softreturn/:id', authorizationFunction, returnOrder)
ordersRoutes.patch('/softcancel/:id', authorizationFunction, cancelOrder)
ordersRoutes.delete('/delete/:id',authorizationFunction ,isAdmin ,deleteOrders)
export default ordersRoutes;