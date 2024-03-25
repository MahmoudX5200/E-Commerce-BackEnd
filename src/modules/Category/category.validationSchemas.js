import joi from "joi";

export const SaddCategory = {
  body: joi.object({
    name: joi.string(),
  }),

  headers: joi
    .object({
      _id: joi.string().hex().length(24),
    })
    .options({ allowUnknown: true }),

};

export const SupdateCategory = {
  body: joi.object({
    name: joi.string(),
    oldPublicId: joi.string(),
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


export const SdeleteCategory = {
  query: joi
    .object({
      BrandId: joi.string().hex().length(24),
    })
    .options({ allowUnknown: true }),
};

export const SgetCategoriesBYId = {
    params: joi
    .object({
        categoryId: joi.string().hex().length(24),
    })
    .options({ allowUnknown: true }),
};
