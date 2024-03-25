import joi from "joi";

export const addBrand = {
  body: joi.object({
    name: joi.string(),
  }),

  headers: joi
    .object({
      _id: joi.string().hex().length(24),
    })
    .options({ allowUnknown: true }),

  query: joi
    .object({
      categoryId: joi.string().hex().length(24),
      subCategoryId: joi.string().hex().length(24),
    })
    .options({ allowUnknown: true }),
};

export const UpdateBrand = {
  body: joi.object({
    name: joi.string().required(),
    oldPublicId: joi.string().required(),
  }),
  headers: joi
    .object({
      _id: joi.string().hex().length(24),
    })
    .options({ allowUnknown: true }),

  query: joi
    .object({
      BrandId: joi.string().hex().length(24),
    })
    .options({ allowUnknown: true }),
};
export const deleteBrand = {
  query: joi
    .object({
      BrandId: joi.string().hex().length(24),
    })
    .options({ allowUnknown: true }),
};
