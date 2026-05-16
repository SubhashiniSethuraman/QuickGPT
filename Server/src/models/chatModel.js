import Joi from 'joi'

export const chatCreateSchema = Joi.object({
    userId: Joi.string().required(),
    userName: Joi.string().required(),
    name: Joi.string().required(),
    messages: Joi.array().items(
        Joi.object({
            isImage: Joi.boolean().required(),
            isPublished: Joi.boolean().default(false),
            role: Joi.string().required(),
            content: Joi.string().required(),
            timestamp: Joi.number().required(),
        })
    ).required()
})