import createHttpError from "http-errors";
import { verifyAccessToken } from "./tools.js";


export const JWTAuthMiddleware = async (request, response, next) => {
    if (!request.headers.authorization) {
        next(createHttpError(401, "Please provide Bearer Token in Authorization header"))
    }
    else {
        const accessToken = request.headers.authorization.split(" ")[1]
        try {
            const payload = await verifyAccessToken(accessToken)
            request.author = { _id: payload._id, role: payload.role }
            next()
        } catch (error) {
            console.log(error)
            next(createHttpError(401, "Token not valid! Please log in again!"))
        }
    }
}