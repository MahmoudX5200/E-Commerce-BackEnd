import joi from "joi";

export const addSubCategoryValidation = {
  body: joi.object({
    name: joi.string(),
  }),

  headers: joi
    .object({
      _id: joi.string().hex().length(24),
    })
    .options({ allowUnknown: true }),

    params: joi
    .object({
        categoryId: joi.string().hex().length(24),
    })
    .options({ allowUnknown: true }),

};

export const updateSubCategoryValidation = {
  body: joi.object({
    name: joi.string(),
    oldPublicId: joi.string(),
  }),
  headers: joi
    .object({
      _id: joi.string().hex().length(24),
    })
    .options({ allowUnknown: true }),

    query: joi
    .object({
        categoryId: joi.string().hex().length(24),
        SubcategoryId: joi.string().hex().length(24),
    })
    .options({ allowUnknown: true }),
};


export const deleteSubCategoryValidation = {
  query: joi
    .object({
        SubcategoryId: joi.string().hex().length(24),
    })
    .options({ allowUnknown: true }),
};

export const getSubCategoryValidationBYId = {
    query: joi
    .object({
        SubcategoryId: joi.string().hex().length(24),
    })
    .options({ allowUnknown: true }),
};
