import {Router} from 'express'
import { addCategory , getAllCategory, updateCategory, deleteCategory, softUpdateCategory, getCategoryCount} from '../controllers/categoriesControllers.js'
import { authorizationFunction } from '../middleware/tokenMiddleware.js'
import { isAdmin } from '../middleware/isAdminMiddleware.js'

const categoriesRoutes = Router()

categoriesRoutes.post('/add', isAdmin ,addCategory)
categoriesRoutes.get('/all', authorizationFunction ,getAllCategory)
categoriesRoutes.get('/count', authorizationFunction, getCategoryCount)
categoriesRoutes.put('/update/:id',isAdmin ,updateCategory)
categoriesRoutes.patch('/softupdate/:id',isAdmin ,softUpdateCategory)
categoriesRoutes.delete('/delete/:id',isAdmin ,deleteCategory)


export default categoriesRoutes