
import { Router } from "express";
const router = Router();
import * as categoryController from './category.contoller.js'
import expressAsyncHandler from "express-async-handler";
import { multerMiddleHost } from "../../middlewares/multer.js";
import { endPointsRoles } from "./category.endpoints.js";
import { auth } from "../../middlewares/auth.middleware.js";
import { allowedExtensions } from "../../utils/allowed-extensions.js";
import { validationMiddleware } from "../../middlewares/validation.middleware.js";
import { SaddCategory, SdeleteCategory, SupdateCategory ,SgetCategoriesBYId} from "./category.validationSchemas.js";


router.post('/',validationMiddleware(SaddCategory),
    auth(endPointsRoles.ADD_CATEGORY),
    multerMiddleHost({
        extensions: allowedExtensions.image
    }).single('image'),
    expressAsyncHandler(categoryController.addCategory)
)

router.put('/:categoryId',validationMiddleware(SupdateCategory),
    auth(endPointsRoles.ADD_CATEGORY),
    multerMiddleHost({
        extensions: allowedExtensions.image
    }).single('image'),
    expressAsyncHandler(categoryController.updateCategory)
)

router.get('/', expressAsyncHandler(categoryController.getAllCategories))

router.get('/:categoryId',validationMiddleware(SgetCategoriesBYId), expressAsyncHandler(categoryController.getCategoriesBYId))

router.get('/featuresCategories', expressAsyncHandler(categoryController.featuresCategories))

router.delete('/:categoryId',validationMiddleware(SdeleteCategory),
    auth(endPointsRoles.ADD_CATEGORY),
    expressAsyncHandler(categoryController.deleteCategory)
)

export default router;