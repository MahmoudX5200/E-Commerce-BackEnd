import joi from "joi";

export const addProductValidation = {
  body: joi.object({
    title: joi.string().trim(),
    desc: joi.string(),
    basePrice: joi.number(),
    discount: joi.number(),
    stock: joi.number().min(1),
  }),

  query: joi
    .object({
        categoryId: joi.string().hex().length(24),
        subCategoryId: joi.string().hex().length(24),
        brandId: joi.string().hex().length(24),
    })
    .options({ allowUnknown: true }),

};

export const updateProductValidation = {
    body: joi.object({
    title: joi.string().trim(),
    desc: joi.string(),
    basePrice: joi.number(),
    discount: joi.number(),
    stock: joi.number().min(1),
    oldPublicId: joi.string(),
  }),
    params: joi
    .object({
        productId: joi.string().hex().length(24),
    })
    .options({ allowUnknown: true }),
};



