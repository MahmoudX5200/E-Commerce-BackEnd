import joi from "joi";

export const addReviwValidation = {
  body: joi.object({
    comment: joi.string(),
    rate: joi.number().min(1).max(5),
    orderId: joi.string().hex().length(24),
  }),
};

export const deleteReviwValidation = {
    query: joi
    .object({
        productId: joi.string().hex().length(24),
        id: joi.string().hex().length(24),
    })
    .options({ allowUnknown: true }),
};
