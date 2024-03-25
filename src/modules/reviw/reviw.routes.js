import { Router } from "express";
import * as reviewController from "./reviw.controller.js";
import expressAsyncHandler from "express-async-handler";
import { auth } from "../../middlewares/auth.middleware.js";
import { validationMiddleware } from "../../middlewares/validation.middleware.js";
import {  addReviwValidation ,deleteReviwValidation} from "./reviw.validation.js";

const router = Router();

router.post("/addReview",validationMiddleware(addReviwValidation),auth(), expressAsyncHandler(reviewController.addReview));
router.delete("/removeReview",validationMiddleware(deleteReviwValidation),auth() ,expressAsyncHandler(reviewController.removeReview));

export default router;
