import joi from "joi";
import { generalValidationRule } from "../../utils/general.validation.rule.js";



export const createOrder = {
    body:joi.object({
        
        phoneNumbers: joi.string().required(),
        address: joi.string().required(),
        couponCode: joi.string(),
        paymentMethod: joi.string().valid("cash", "card").required(),
        city: joi.string().required(),
        postalCode: joi.string().valid("cash", "card").required(),
        country: joi.string().valid("cash", "card").required(),
       
    })
}