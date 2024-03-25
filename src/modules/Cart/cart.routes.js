
import { Router } from "express";
import * as  cartController from "./cart.controller.js";
import expressAsyncHandler from "express-async-handler";
import { auth } from "../../middlewares/auth.middleware.js";
import { systemRoles } from "../../utils/system-roles.js";
import { validationMiddleware } from "../../middlewares/validation.middleware.js";
import { addProductToCartValidation, removeFromcartValidation, addProductToCartEnhanceValidation } from "./cart.validation.js";

const router = Router();





router.post('/',validationMiddleware(addProductToCartValidation) ,auth([systemRoles.USER]), expressAsyncHandler(cartController.addProductToCart))

router.put('/:productId',validationMiddleware(removeFromcartValidation) ,auth([systemRoles.USER]), expressAsyncHandler(cartController.removeFromcart))
router.post('/addProductToCartEnhance',validationMiddleware(addProductToCartEnhanceValidation) ,auth([systemRoles.USER]), expressAsyncHandler(cartController.addProductToCart))

export default router;