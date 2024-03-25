
import { Router } from "express";
import * as authController from './auth.controller.js';
import expressAsyncHandler from "express-async-handler";
import { auth } from "../../middlewares/auth.middleware.js";
import { systemRoles } from "../../utils/system-roles.js";
const router = Router();


router.post('/', expressAsyncHandler(authController.signUp))
router.get('/verify-email', expressAsyncHandler(authController.verifyEmail))


router.post('/login', expressAsyncHandler(authController.signIn))

router.post('/forgetPassword', expressAsyncHandler(authController.forgetPassword))
router.post('/resetPassword', expressAsyncHandler(authController.resetPassword))
router.post('/refreshToken', expressAsyncHandler(authController.refreshToken))
router.post('/update_password',auth([systemRoles.USER,systemRoles.SUPER_ADMIN,systemRoles.DELIEVER_ROLE,systemRoles.ADMIN]) ,expressAsyncHandler(authController.update_password))



export default router;