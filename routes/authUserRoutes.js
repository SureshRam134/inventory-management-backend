import { Router } from "express"
import { isAdmin } from "../middleware/isAdminMiddleware.js"
import { deleteUser, getAllUser, softUpdateUser, updateUser, userRegister, getUsersCount } from "../controllers/authControllers.js"
import { authorizationFunction } from "../middleware/tokenMiddleware.js"
import upload from "../middleware/upload.js"


const authUserRoutes = Router()

authUserRoutes.post('/create', upload.single("image"),authorizationFunction, isAdmin, userRegister)
authUserRoutes.get('/all', authorizationFunction, getAllUser)
authUserRoutes.get('/count', authorizationFunction, getUsersCount)
authUserRoutes.put('/update/:id',upload.single("image"), isAdmin, updateUser)
authUserRoutes.delete('/delete/:id', isAdmin, deleteUser)
authUserRoutes.patch('/softupdate/:id',isAdmin ,softUpdateUser)




export default authUserRoutes