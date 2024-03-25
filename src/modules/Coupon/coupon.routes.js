
import { Router } from "express";
import * as  couponController from "./coupon.controller.js";
import expressAsyncHandler from "express-async-handler";
import { auth } from "../../middlewares/auth.middleware.js";
import { endpointsRoles } from "./coupon.endpoints.js";
import { validationMiddleware } from "../../middlewares/validation.middleware.js"
import * as validators from  './coupon.validationSchemas.js';
const router = Router();


router.post('/addCoupon', 
auth(endpointsRoles.ADD_COUPOUN), 
validationMiddleware(validators.addCouponSchema),
 expressAsyncHandler(couponController.addCoupon));

router.put('/updateCoupon', 
auth(endpointsRoles.ADD_COUPOUN), 
// validationMiddleware(validators.addCouponSchema),
 expressAsyncHandler(couponController.updateCoupon));


 router.get('/getCouponById', 
 // validationMiddleware(validators.addCouponSchema),
  expressAsyncHandler(couponController.getCouponById));

router.get('/applyCoupon', 
auth(endpointsRoles.ADD_COUPOUN), 
// validationMiddleware(validators.addCouponSchema),
 expressAsyncHandler(couponController.applyCoupon));

router.get('/getAllDisabledCoupons', 
// validationMiddleware(validators.addCouponSchema),
 expressAsyncHandler(couponController.getAllDisabledCoupons));

router.get('/getAllEnabledCoupons', 
// validationMiddleware(validators.addCouponSchema),
 expressAsyncHandler(couponController.getAllEnabledCoupons));


 
export default router;