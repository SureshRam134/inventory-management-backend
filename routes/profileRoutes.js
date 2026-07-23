import {Router} from "express"
import { getCurrentProfile, updateProfile } from "../controllers/profileControllers.js"
import { authorizationFunction } from "../middleware/tokenMiddleware.js"
import upload from "../middleware/upload.js"

const profileRoutes = Router()
profileRoutes.get('/get', authorizationFunction, getCurrentProfile)
profileRoutes.put('/update', authorizationFunction ,upload.single("image"), updateProfile)

export default profileRoutes