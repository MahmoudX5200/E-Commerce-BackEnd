import { Router } from "express";
import expressAsyncHandler from "express-async-handler";
import { systemRoles } from "../../utils/system-roles.js";
import * as userController from './user.controller.js'
import { auth } from "../../middlewares/auth.middleware.js";
import { validationMiddleware } from "../../middlewares/validation.middleware.js";
import { updateUserValidation } from "./user.validation.js";

const router = Router();

router.put('/updateProfile',validationMiddleware(updateUserValidation),auth([systemRoles.USER,systemRoles.ADMIN,systemRoles.SUPER_ADMIN]), expressAsyncHandler(userController.updateAccount))
router.delete('/deleteProfile',auth([systemRoles.USER,systemRoles.ADMIN,systemRoles.SUPER_ADMIN]), expressAsyncHandler(userController.deleteAccount))
router.get('/getUserProfile', auth([systemRoles.USER,systemRoles.ADMIN,systemRoles.SUPER_ADMIN]), expressAsyncHandler(userController.getUserProfile))
router.delete('/deleteSoft', auth([systemRoles.USER,systemRoles.ADMIN,systemRoles.SUPER_ADMIN]), expressAsyncHandler(userController.deleteSoft))

export default router;
