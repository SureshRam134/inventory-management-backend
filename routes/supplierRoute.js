import {Router} from 'express'
import { isAdmin } from '../middleware/isAdminMiddleware.js'
import { addSupplier, getAllSupplier, updateSupplier, softUpdateSupplier, deleteSupplier, getSupplierCount } from '../controllers/supplierController.js'
import { authorizationFunction } from '../middleware/tokenMiddleware.js'

const supplierRoute = Router()

supplierRoute.post('/add', isAdmin ,addSupplier)
supplierRoute.get('/all', authorizationFunction ,getAllSupplier)
supplierRoute.put('/update/:id',isAdmin ,updateSupplier)
supplierRoute.get('/count', authorizationFunction, getSupplierCount)
supplierRoute.patch('/softupdate/:id',isAdmin ,softUpdateSupplier)
supplierRoute.delete('/delete/:id',isAdmin ,deleteSupplier)


export default supplierRoute