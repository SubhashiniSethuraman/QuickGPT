import Joi from "joi"

export const transactionSchema = Joi.object({
    userId: Joi.string().required(),
    planId: Joi.string().required(),
    amount: Joi.number().required(),
    credits: Joi.number().required(),
    isPaid: Joi.boolean().default(false),
})