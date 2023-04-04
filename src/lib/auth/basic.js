import createHttpError from "http-errors"
import atob from "atob"
import AuthorsModel from '../../api/authors/model.js'

export const basicAuthMiddleware = async (request, response, next) => {
    if (!request.headers.authorization) {
        next(createHttpError(401, "Please provide credentials in Authorization header"))
    } else {

        const encodedCredentials = request.headers.authorization.split(" ")[1]

        const credentials = atob(encodedCredentials)
        const [email, password] = credentials.split(":")

        const author = await AuthorsModel.checkCredentials(email, password)

        if (author) {
            request.author = author
            next()
        } else {
            next(createHttpError(401, "Credentials are not ok!"))
        }
    }
}