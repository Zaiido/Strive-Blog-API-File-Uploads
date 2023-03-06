import Express from "express";
import uniqid from "uniqid"
import { getAuthors, writeAuthors } from "../../lib/fs-tools.js";
import createHttpError from "http-errors";
import multer from "multer";
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from "multer-storage-cloudinary";


const authorsRouter = Express.Router()

authorsRouter.get("/", async (request, response, next) => {
    try {
        const authorsFile = await getAuthors()
        response.send(authorsFile)
    } catch (error) {
        next(error)
    }

})


authorsRouter.post("/", async (request, response, next) => {
    try {
        const authors = await getAuthors()
        let resFromMatch = await fetch('http://localhost:3000/authors/checkEmail', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: request.body.email
            })
        })
        let matchOrNot = await resFromMatch.json()
        if (matchOrNot) {
            response.status(400).send("An author with this email already exists.")
        } else {
            const newAuthor = {
                ...request.body,
                ID: uniqid(),
                avatar: `https://ui-avatars.com/api/?name=${request.body.name}+${request.body.surname}`
            }
            authors.push(newAuthor)

            await writeAuthors(authors)

            response.status(201).send({ id: newAuthor.ID })
        }

    } catch (error) {
        next(error)
    }


})


// EXTRA 1
authorsRouter.post("/checkEmail", async (request, response, next) => {
    try {
        const authors = await getAuthors()
        const matchOrNot = authors.some(author => author.email === request.body.email)
        response.send(matchOrNot)
    } catch (error) {
        next(error)
    }

})


authorsRouter.get("/:authorId", async (request, response, next) => {
    try {
        const authors = await getAuthors()

        const foundAuthor = authors.find(author => author.ID === request.params.authorId)
        if (foundAuthor) {
            response.send(foundAuthor)

        } else {
            next(createHttpError(400, { message: `Author with id ${request.params.authorId} was not found` }))
        }

    } catch (error) {
        next(error)
    }


})


authorsRouter.put("/:authorId", async (request, response, next) => {
    try {
        const authors = await getAuthors()
        const index = authors.findIndex(author => author.ID === request.params.authorId)
        if (index !== -1) {
            const authorToUpdate = authors[index]
            const updatedAuthor = { ...authorToUpdate, ...request.body }
            authors[index] = updatedAuthor

            await writeAuthors(authors)

            response.send(updatedAuthor)
        } else {
            next(createHttpError(400, { message: `Author with id ${request.params.authorId} was not found` }))
        }

    } catch (error) {
        next(error)
    }

})


authorsRouter.delete("/:authorId", async (request, response, next) => {
    try {

        const authors = await getAuthors()
        const newAuthors = authors.filter(author => author.ID !== request.params.authorId)

        if (authors.length !== newAuthors.length) {
            await writeAuthors(newAuthors)
            response.status(204).send()
        } else {
            next(createHttpError(400, { message: `Author with id ${request.params.authorId} was not found` }))
        }


    } catch (error) {
        next(error)
    }
})




const cloudinaryUploader = multer({
    storage: new CloudinaryStorage({
        cloudinary,
        params: {
            folder: "fs0522/authorsAvatars"
        }
    })
}).single('avatar')


authorsRouter.post("/:authorId/uploadAvatar", cloudinaryUploader, async (request, response, next) => {
    try {
        // const originalFileExtension = extname(request.file.originalname)
        // const fileName = request.params.authorId + originalFileExtension
        // await saveAuthorsAvatars(fileName, request.file.buffer)
        // console.log(request.file)

        const authors = await getAuthors()
        const index = authors.findIndex(author => author.ID === request.params.authorId)
        const authorToUpdate = authors[index]
        const updatedAuthor = { ...authorToUpdate, avatar: request.file.path }
        authors[index] = updatedAuthor

        await writeAuthors(authors)

        response.send({ message: "Avatar uploaded" })

    } catch (error) {
        next(error)
    }
})

export default authorsRouter
