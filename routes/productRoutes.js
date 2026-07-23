import {Router} from 'express'
import { authorizationFunction } from '../middleware/tokenMiddleware.js';
import { getCategory, getSupplier, addProducts, getAllProduct, updateProduct, deleteProduct, getProductCount } from '../controllers/productControllers.js';
import { isAdmin } from '..//middleware/isAdminMiddleware.js';
import upload from '../middleware/upload.js';


const productRoutes = Router();
    productRoutes.get('/category', authorizationFunction, getCategory )
    productRoutes.get('/supplier', authorizationFunction, getSupplier )
    productRoutes.get('/all', authorizationFunction , getAllProduct )
    productRoutes.get('/count', authorizationFunction , getProductCount )
    productRoutes.post('/add', isAdmin , upload.single("image"),addProducts )
    productRoutes.put('/update/:id', isAdmin, upload.single("image") , updateProduct )
    productRoutes.delete('/delete/:id', isAdmin , deleteProduct )

export default productRoutes 