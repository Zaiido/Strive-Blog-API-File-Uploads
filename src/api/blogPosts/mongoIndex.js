import Express from 'express'
import createHttpError from 'http-errors'
import BlogPostsModel from './model.js'


const postsRouter = Express.Router()

postsRouter.get("/", async (request, response, next) => {
    try {
        const blogs = await BlogPostsModel.find()
        response.send(blogs)
    } catch (error) {
        next(error)
    }
})

postsRouter.post("/", async (request, response, next) => {
    try {
        const newBlog = new BlogPostsModel(request.body)
        const { _id } = await newBlog.save()
        response.status(201).send({ _id })
    } catch (error) {
        next(error)
    }
})

postsRouter.get("/:postId", async (request, response, next) => {
    try {
        const blog = await BlogPostsModel.findById(request.params.postId)
        if (blog) {
            response.send(blog)
        } else {
            next(createHttpError(404, { message: `Blog with _id ${request.params.postId} was not found!` }))
        }
    } catch (error) {
        next(error)
    }
})

postsRouter.put("/:postId", async (request, response, next) => {
    try {
        const updatedBlog = await BlogPostsModel.findByIdAndUpdate(request.params.postId, request.body, { new: true, runValidators: true })
        if (updatedBlog) {
            response.send(updatedBlog)
        } else {
            next(createHttpError(404, { message: `Blog with _id ${request.params.postId} was not found!` }))
        }

    } catch (error) {
        next(error)
    }
})

postsRouter.delete("/:postId", async (request, response, next) => {
    try {
        const deletedBlog = await BlogPostsModel.findByIdAndDelete(request.params.postId)
        if (deletedBlog) {
            response.status(204).send()
        } else {
            next(createHttpError(404, { message: `Blog with _id ${request.params.postId} was not found!` }))
        }

    } catch (error) {
        next(error)
    }
})
export default postsRouter