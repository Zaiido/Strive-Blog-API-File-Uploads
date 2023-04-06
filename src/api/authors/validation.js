import { checkSchema, validationResult } from "express-validator";
import createHttpError from "http-errors";


const authorSchema = {
    name: {
        in: ["body"],
        isString: {
            errorMessage: "Name is a mandatory field and needs to be a string!",
        },
    },
    surname: {
        in: ["body"],
        isString: {
            errorMessage: "Surname is a mandatory field and needs to be a string!",
        },
    },
    email: {
        in: ["body"],
        isString: {
            errorMessage: "Email is a mandatory field and needs to be a string!",
        },
    },
    password: {
        in: ["body"],
        isString: {
            errorMessage: "Password is a mandatory field and needs to be a string!",
        },
    }
}
export const checkAuthorSchema = checkSchema(authorSchema)


export const generateBadRequest = (request, response, next) => {
    const errors = validationResult(request)

    console.log(errors.array())

    if (errors.isEmpty()) {
        next()
    } else {
        next(createHttpError(400, "Errors during author validation", { errorsList: errors.array() }))
    }
}