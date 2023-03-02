import { checkSchema, validationResult } from "express-validator";
import createHttpError from "http-errors";


const postSchema = {
    category: {
        in: ["body"],
        isString: {
            errorMessage: "Category is a mandatory field and needs to be a string!",
        },
    },
    title: {
        in: ["body"],
        isString: {
            errorMessage: "Title is a mandatory field and needs to be a string!",
        },
    },
    cover: {
        in: ["body"],
        isString: {
            errorMessage: "Cover image URL is a mandatory field and needs to be a string!",
        },
    },
    'readTime.value': {
        in: ['body'],
        isNumeric: {
            errorMessage: 'Read time value is required and must be a number',
        }
    },
    'readTime.unit': {
        in: ['body'],
        isString: true,
        isIn: {
            options: [['minute', 'hour', 'day']],
            errorMessage: 'Read time unit is required and must be either minute, hour, or day',
        },
    },
    'author.name': {
        in: ['body'],
        isString: {
            errorMessage: 'Author name is required and must be a string'
        },
    },
    'author.avatar': {
        in: ['body'],
        isString: {
            errorMessage: 'Author avatar URL is required and must be a valid URL'
        }
    },
    content: {
        in: ["body"],
        isString: {
            errorMessage: "Content is a mandatory field and needs to be a string!",
        },
    },
}

export const checkPostSchema = checkSchema(postSchema)


export const callBadRequest = (request, response, next) => {
    const errors = validationResult(request)

    console.log(errors.array())

    if (errors.isEmpty()) {
        next()
    } else {
        next(createHttpError(400, "Errors during post validation", { errorsList: errors.array() }))
    }
}