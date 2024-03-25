import { Router } from 'express'
import expressAsyncHandler from 'express-async-handler'

import * as productController from './product.controller.js'
import { auth } from '../../middlewares/auth.middleware.js'
import { multerMiddleHost } from '../../middlewares/multer.js'
import { allowedExtensions } from '../../utils/allowed-extensions.js'
import { endPointsRoles } from './product.endpoints.js'
import { validationMiddleware } from "../../middlewares/validation.middleware.js";
import {  addProductValidation ,updateProductValidation} from "./product.validation.js";

const router = Router()



router.post('/',validationMiddleware(addProductValidation),
    auth(endPointsRoles.ADD_PRODUCT),
    multerMiddleHost({ extensions: allowedExtensions.image }).array('image', 3),
    expressAsyncHandler(productController.addProduct)
)


router.put('/:productId',validationMiddleware(updateProductValidation),  
    auth(endPointsRoles.ADD_PRODUCT),
    multerMiddleHost({ extensions: allowedExtensions.image }).single('image'),
    expressAsyncHandler(productController.updateProduct)
)

router.get('/', expressAsyncHandler(productController.getAllProducts))
router.get('/getoneProducts', expressAsyncHandler(productController.getoneProducts))


export default router
