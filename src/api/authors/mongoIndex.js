import Express from "express"
import createError from "http-errors"
import AuthorsModel from "./model.js"
import { basicAuthMiddleware } from "../../lib/auth/basic.js"
import createHttpError from "http-errors"


const authorsRouter = Express.Router()

authorsRouter.post("/", async (request, response, next) => {
    try {
        const newAuthor = new AuthorsModel(request.body)
        const { _id } = await newAuthor.save()
        response.status(201).send({ _id })
    } catch (error) {
        next(error)
    }
})

authorsRouter.get("/", async (request, response, next) => {
    try {
        const authors = await AuthorsModel.find()
        response.send(authors)
    } catch (error) {
        next(error)
    }
})


authorsRouter.get("/:authorId", async (request, response, next) => {
    try {
        const author = await AuthorsModel.findById(request.params.authorId)
        if (author) {
            response.send(author)
        } else {
            next(createError(404, `Author with id ${request.params.authorId} not found!`))
        }
    } catch (error) {
        next(error)
    }
})

authorsRouter.put("/:authorId", basicAuthMiddleware, async (request, response, next) => {
    try {
        if (request.author._id.toString() === request.params.authorId || request.author.role === "Admin") {
            const updatedAuthor = await AuthorsModel.findByIdAndUpdate(request.params.authorId, request.body, { new: true, runValidators: true })
            if (updatedAuthor) {
                response.send(updatedAuthor)
            } else {
                next(createError(404, `Author with id ${request.params.authorId} not found!`))
            }
        } else {
            next(createHttpError(403, "You are not authorized to update this author!"))
        }

    } catch (error) {
        next(error)
    }
})

authorsRouter.delete("/:authorId", basicAuthMiddleware, async (request, response, next) => {
    try {
        if (request.author._id.toString() === request.params.authorId || request.author.role === "Admin") {
            const deletedAuthor = await AuthorsModel.findByIdAndDelete(request.params.authorId)
            if (deletedAuthor) {
                response.status(204).send()
            } else {
                next(createError(404, `Author with id ${request.params.authorId} not found!`))
            }
        } else {
            next(createHttpError(403, "You are not authorized to delete this author!"))

        }

    } catch (error) {
        next(error)
    }
})

export default authorsRouter