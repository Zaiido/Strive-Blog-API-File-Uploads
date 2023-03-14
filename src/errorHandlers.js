import mongoose from "mongoose"



export const badRequestHandler = (error, request, response, next) => {
    if (error.status === 400 || error instanceof mongoose.Error.ValidationError) {
        if (error.errorsList) {
            response.status(400).send({ message: error.message, errorsList: error.errorsList.map(e => e.msg) })

        } else {
            response.status(400).send({ message: error.message })

        }
    } else if (error instanceof mongoose.Error.CastError) {
        response.status(400).send({ message: "You've sent a wrong _id in request params" })
    }
    else {
        next(error)
    }
}

export const notfoundHandler = (error, request, response, next) => {
    if (error.status === 404) {
        response.status(404).send({ message: error.message })
    } else {
        next(error)
    }
}


export const generalErrorHandler = (error, request, response, next) => {
    console.log("ERROR:", error)
    response.status(500).send({ message: "Something went wrong! Please try again later" })
}