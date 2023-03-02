import Express from "express";
import { dirname, extname, join } from 'path'
import { fileURLToPath } from "url";
import fs from 'fs'
import uniqid from 'uniqid'
import createHttpError from "http-errors";
import { callBadRequest, checkPostSchema } from "./validation.js";
import { getPosts, savePostsCovers, writePosts } from "../../lib/fs-tools.js";
import multer from "multer";


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

postsRouter.post("/:postId/uploadCover", multer().single("cover"), async (request, response, next) => {
    try {
        const originalFileExtension = extname(request.file.originalname)
        const fileName = request.params.postId + originalFileExtension
        console.log(request.params.postId)
        await savePostsCovers(fileName, request.file.buffer)

        const posts = await getPosts()
        const index = posts.findIndex(post => post._id === request.params.postId)
        if (index !== -1) {
            const oldPost = posts[index]
            const updatedPost = { ...oldPost, cover: `http://localhost:3001/images/postsCover/${fileName}` }
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
            response.send({ comments: post.comments })
        } else {
            response.send({ message: `The post with id ${request.params.postId} has no comments.` })
        }

    } catch (error) {
        next(error)
    }
})


export default postsRouter