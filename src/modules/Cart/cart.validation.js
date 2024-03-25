import joi from "joi";

export const addProductToCartValidation = {
  body: joi.object({
    quantity: joi.number().required(),
    productId: joi.string().hex().length(24),
  }).options({ allowUnknown: true }),

  headers: joi
    .object({
      _id: joi.string().hex().length(24),
    })
    .options({ allowUnknown: true }),

};

export const removeFromcartValidation = {
    params: joi
    .object({
        productId: joi.string().hex().length(24),
    })
    .options({ allowUnknown: true }),
    
    headers: joi
    .object({
      _id: joi.string().hex().length(24),
    })
    .options({ allowUnknown: true }),
};

export const addProductToCartEnhanceValidation = {
  body: joi.object({
    quantity: joi.number().required(),
    productId: joi.string().hex().length(24),
  }).options({ allowUnknown: true }),

  headers: joi
    .object({
      _id: joi.string().hex().length(24),
    })
    .options({ allowUnknown: true }),
};

