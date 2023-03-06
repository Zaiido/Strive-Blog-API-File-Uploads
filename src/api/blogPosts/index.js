import Express from "express";
import uniqid from 'uniqid';
import createHttpError from "http-errors";
import { callBadRequest, checkPostSchema } from "./validation.js";
import { getPosts, writePosts } from "../../lib/fs-tools.js";
import multer from "multer";
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from "multer-storage-cloudinary";


const postsRouter = Express.Router()



postsRouter.get("/", async (request, response, next) => {
    try {
        const posts = await getPosts()

        if (request.query && request.query.title) {
            const matchedPosts = posts.filter(post => post.title.toLowerCase().includes(request.query.title.toLowerCase()))
            response.send(matchedPosts)
        } else {
            response.send(posts)
        }
    } catch (error) {
        next(error)
    }

})


postsRouter.post("/", checkPostSchema, callBadRequest, async (request, response, next) => {
    try {
        const newPost = { _id: uniqid(), ...request.body, createdAt: new Date(), updatedAt: new Date() }

        const posts = await getPosts()
        posts.push(newPost)
        await writePosts(posts)

        response.status(201).send({ _id: newPost._id })
    } catch (error) {
        next(error)
    }


})


postsRouter.get("/:postId", async (request, response, next) => {
    try {
        const posts = await getPosts()
        const foundPost = posts.find(post => post._id === request.params.postId)

        if (foundPost) {
            response.send(foundPost)
        } else {
            next(createHttpError(404, `Post with id ${request.params.postId} was not found!`))
        }

    } catch (error) {
        next(error)
    }

})


postsRouter.put("/:postId", async (request, response, next) => {

    try {
        const posts = await getPosts()
        const index = posts.findIndex(post => post._id === request.params.postId)
        if (index !== -1) {
            const oldPost = posts[index]
            const updatedPost = { ...oldPost, ...request.body, updatedAt: new Date() }
            posts[index] = updatedPost
            await writePosts(posts)
            response.send(updatedPost)
        } else {
            next(createHttpError(404, `Post with id ${request.params.postId} was not found!`))
        }
    } catch (error) {
        next(error)
    }

})
postsRouter.delete("/:postId", async (request, response, next) => {
    try {
        const posts = await getPosts()
        const filteredPosts = posts.filter(post => post._id !== request.params.postId)

        if (posts.length !== filteredPosts.length) {
            await writePosts(filteredPosts)
            response.status(204).send()
        } else {
            next(createHttpError(404, `Post with id ${request.params.postId} was not found!`))
        }

    } catch (error) {
        next(error)
    }
})

// COVER IMAGE UPLOAD

const cloudinaryUploader = multer({
    storage: new CloudinaryStorage({
        cloudinary,
        params: {
            folder: "fs0522/blogCovers"
        }
    })
}).single('cover')

postsRouter.post("/:postId/uploadCover", cloudinaryUploader, async (request, response, next) => {
    try {
        // const originalFileExtension = extname(request.file.originalname)
        // const fileName = request.params.postId + originalFileExtension
        // console.log(request.file)
        // await savePostsCovers(fileName, request.file.buffer)

        const posts = await getPosts()
        const index = posts.findIndex(post => post._id === request.params.postId)
        if (index !== -1) {
            const oldPost = posts[index]
            const updatedPost = { ...oldPost, cover: request.file.path }
            posts[index] = updatedPost
            await writePosts(posts)
        }

        response.send({ message: "Cover uploaded" })

    } catch (error) {
        next(error)
    }
})

// POST COMMENTS

postsRouter.post("/:postId/comments", async (request, response, next) => {

    const newComment = { _id: uniqid(), ...request.body, createdAt: new Date(), updatedAt: new Date() }

    const posts = await getPosts()
    const index = posts.findIndex(post => post._id === request.params.postId)
    if (index !== -1) {
        const oldPost = posts[index]
        const updatedComments = oldPost.comments ? [...oldPost.comments, newComment] : [newComment]
        const updatedPost = { ...oldPost, comments: updatedComments }
        posts[index] = updatedPost
        await writePosts(posts)
    }

    response.status(201).send({ message: `Comment with id ${newComment._id} added!` })
})

// GET COMMENTS

postsRouter.get("/:postId/comments", async (request, response, next) => {
    try {
        const posts = await getPosts()
        const post = posts.find(post => post._id === request.params.postId)
        if (post.comments) {
            response.send(post.comments)
        } else {
            response.send(`The post with id ${request.params.postId} has no comments.`)
        }

    } catch (error) {
        next(error)
    }
})

// DELETE COMMENT

postsRouter.delete("/:postId/comments/:commentId", async (request, response, next) => {
    try {
        const posts = await getPosts()
        const index = posts.findIndex(post => post._id === request.params.postId)
        const oldPost = posts[index]
        const newComments = oldPost.comments.filter(comment => comment._id !== request.params.commentId)
        const newPost = { ...oldPost, comments: newComments }
        posts[index] = newPost
        await writePosts(posts)
        response.status(204).send()
    } catch (error) {
        next(error)
    }
})

// PUT COMMENT 

postsRouter.put("/:postId/comments/:commentId", async (request, response, next) => {
    try {
        const posts = await getPosts()
        const post = posts.find(post => post._id === request.params.postId)
        const index = post.comments.findIndex(comment => comment._id === request.params.commentId)
        const oldComment = post.comments[index]
        const updatedComment = { ...oldComment, ...request.body, updatedAt: new Date() }
        post.comments[index] = updatedComment

        await writePosts(posts)

        response.send(updatedComment)
    } catch (error) {
        next(error)
    }
})

export default postsRouter