import {Router} from "express"
import {userRegister, checkEmailFunction, passwordVerifiFunction, otpVerifiFunction } from "../controllers/authControllers.js"

const authRoute = Router()
authRoute.post('/register' , userRegister)
authRoute.post('/checkEmail' , checkEmailFunction)
authRoute.post('/password' , passwordVerifiFunction)
authRoute.post('/verifyopt' , otpVerifiFunction)
export default authRoute