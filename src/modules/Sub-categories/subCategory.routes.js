
import { Router } from "express";
const router = Router();
import * as subCategoryController from './subCategory.controller.js'
import expressAsyncHandler from "express-async-handler";
import { multerMiddleHost } from "../../middlewares/multer.js";
import { endPointsRoles } from "../Category/category.endpoints.js";
import { auth } from "../../middlewares/auth.middleware.js";
import { allowedExtensions } from "../../utils/allowed-extensions.js";
import { validationMiddleware } from "../../middlewares/validation.middleware.js";
import {  addSubCategoryValidation ,updateSubCategoryValidation,deleteSubCategoryValidation,getSubCategoryValidationBYId} from "./subCategory.validationSchemas.js";


router.post('/:categoryId',validationMiddleware(addSubCategoryValidation),
    auth(endPointsRoles.ADD_CATEGORY),
    multerMiddleHost({
        extensions: allowedExtensions.image
    }).single('image'),
    expressAsyncHandler(subCategoryController.addSubCategory))

router.put('/UpdateSubCategory',validationMiddleware(updateSubCategoryValidation), 
    auth(endPointsRoles.ADD_CATEGORY),
    multerMiddleHost({
        extensions: allowedExtensions.image
    }).single('image'),
    expressAsyncHandler(subCategoryController.UpdateSubCategory)
)

router.delete('/deleteCategory',validationMiddleware(deleteSubCategoryValidation),
    auth(endPointsRoles.ADD_CATEGORY),
    expressAsyncHandler(subCategoryController.deleteCategory)
)
    
 router.get('/', expressAsyncHandler(subCategoryController.getAllSubCategories))
 router.post('/getSubcategoryById',validationMiddleware(getSubCategoryValidationBYId), expressAsyncHandler(subCategoryController.getSubcategoryById))
 router.get('/featuresSubCategories', expressAsyncHandler(subCategoryController.featuresSubCategories))




export default router;