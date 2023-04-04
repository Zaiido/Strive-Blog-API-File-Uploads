import Express from 'express'
import createHttpError from 'http-errors'
import BlogPostsModel from './model.js'
import q2m from 'query-to-mongo'
import { basicAuthMiddleware } from '../../lib/auth/basic.js'


const postsRouter = Express.Router()


postsRouter.get("/me/stories", basicAuthMiddleware, async (request, response, next) => {
    try {
        const blogs = await BlogPostsModel.find({
            authors: { $in: [request.author._id] }
        }).populate('authors')
        response.send(blogs)
    } catch (error) {
        next(error)
    }
})

postsRouter.get("/", async (request, response, next) => {
    try {
        const mongoQuery = q2m(request.query)
        const { blogs, totalDocuments } = await BlogPostsModel.findBlogs(mongoQuery)
        response.send({
            links: mongoQuery.links(`${process.env.BE_URL}/blogPosts`, totalDocuments),
            totalDocuments,
            numberOfPages: Math.ceil(totalDocuments / mongoQuery.options.limit),
            blogs
        })
    } catch (error) {
        next(error)
    }
})

postsRouter.post("/", basicAuthMiddleware, async (request, response, next) => {
    try {
        const newBlog = new BlogPostsModel(request.body)
        newBlog.authors = [...newBlog.authors, request.author._id] // Add the author _id from the authorized author
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

postsRouter.put("/:postId", basicAuthMiddleware, async (request, response, next) => {
    try {
        const blog = await BlogPostsModel.findById(request.params.postId)
        if (blog.authors.includes(request.author._id) || request.author.role === 'Admin') {
            const updatedBlog = await BlogPostsModel.findByIdAndUpdate(request.params.postId, request.body, { new: true, runValidators: true })
            if (updatedBlog) {
                response.send(updatedBlog)
            } else {
                next(createHttpError(404, { message: `Blog with _id ${request.params.postId} was not found!` }))
            }

        } else {
            next(createHttpError(403, "You are not authorized to update this blog!"))
        }

    } catch (error) {
        next(error)
    }
})

postsRouter.delete("/:postId", basicAuthMiddleware, async (request, response, next) => {
    try {
        const blog = await BlogPostsModel.findById(request.params.postId)
        if (blog.authors.includes(request.author._id) || request.author.role === 'Admin') {
            const deletedBlog = await BlogPostsModel.findByIdAndDelete(request.params.postId)
            if (deletedBlog) {
                response.status(204).send()
            } else {
                next(createHttpError(404, { message: `Blog with _id ${request.params.postId} was not found!` }))
            }
        } else {
            next(createHttpError(403, "You are not authorized to delete this blog!"))

        }

    } catch (error) {
        next(error)
    }
})


// COMMENTS


postsRouter.get("/:postId/comments", async (request, response, next) => {
    try {
        const post = await BlogPostsModel.findById(request.params.postId)
        if (post) {
            response.send(post.comments)
        } else {
            next(createHttpError(404, { message: `Blog with _id ${request.params.postId} was not found!` }))

        }
    } catch (error) {
        next(error)
    }
})


postsRouter.post("/:postId", async (request, response, next) => {
    try {
        const post = await BlogPostsModel.findById(request.params.postId)
        if (post) {
            const newComment = { ...request.body, createdAt: new Date(), updatedAt: new Date() }
            const updatedPost = await BlogPostsModel.findByIdAndUpdate(
                request.params.postId,
                { $push: { comments: newComment } },
                { new: true, runValidators: true }
            )
            if (updatedPost) {
                response.send(updatedPost)
            } else {
                next(createHttpError(404, { message: `Blog with _id ${request.params.postId} was not found!` }))
            }
        } else {
            next(createHttpError(404, { message: `Blog with _id ${request.params.postId} was not found!` }))
        }
    } catch (error) {
        next(error)
    }
})


postsRouter.get("/:postId/comments/:commentId", async (request, response, next) => {
    try {
        const post = await BlogPostsModel.findById(request.params.postId)

        if (post) {
            const comment = post.comments.find(comment => comment._id.toString() === request.params.commentId)
            if (comment) {
                response.send(comment)
            } else {
                next(createHttpError(404, { message: `Comment with _id ${request.params.commentId} was not found!` }))
            }
        } else {
            next(createHttpError(404, { message: `Blog with _id ${request.params.postId} was not found!` }))
        }
    } catch (error) {
        next(error)
    }
})


postsRouter.put("/:postId/comment/:commentId", async (request, response, next) => {
    try {
        const post = await BlogPostsModel.findById(request.params.postId)
        if (post) {
            const index = post.comments.findIndex(comment => comment._id.toString() === request.params.commentId)
            if (index !== -1) {
                post.comments[index] = { ...post.comments[index].toObject(), ...request.body, updatedAt: new Date() }
                await post.save()
                response.send(post)
            } else {
                next(createHttpError(404, { message: `Comment with _id ${request.params.commentId} was not found!` }))
            }
        } else {
            next(createHttpError(404, { message: `Blog with _id ${request.params.postId} was not found!` }))
        }
    } catch (error) {
        next(error)
    }
})


postsRouter.delete("/:postId/comment/:commentId", async (request, response, next) => {
    try {
        const updatedPost = await BlogPostsModel.findByIdAndUpdate(
            request.params.postId,
            { $pull: { comments: { _id: request.params.commentId } } },
            { new: true, runValidators: true }
        )
        if (updatedPost) {
            response.send(updatedPost)
        } else {
            next(createHttpError(404, { message: `Blog with _id ${request.params.postId} was not found!` }))
        }
    } catch (error) {
        next(error)
    }
})


// LIKES

postsRouter.post("/:postId/likes", async (request, response, next) => {
    try {
        const post = await BlogPostsModel.findById(request.params.postId)
        if (!post) return next(createHttpError(404, { message: `Blog with _id ${request.params.postId} was not found!` }))

        const { authorId } = request.body
        const authorInLikes = post.likes.find(authorRef => authorId === authorRef.toString())

        if (authorInLikes) {
            const postToUpdate = await BlogPostsModel.findByIdAndUpdate(
                request.params.postId,
                { $pull: { likes: authorId } },
                { new: true, runValidators: true }
            )
            response.send({ likesInTotal: postToUpdate.likes.length, likesArray: postToUpdate.likes })
        } else {
            const postToUpdate = await BlogPostsModel.findByIdAndUpdate(
                request.params.postId,
                { $push: { likes: authorId } },
                { new: true, runValidators: true }
            )
            response.send({ likesInTotal: postToUpdate.likes.length, likesArray: postToUpdate.likes })
        }

    } catch (error) {
        next(error)
    }
})


export default postsRouter