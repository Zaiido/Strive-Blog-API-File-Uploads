import Express from "express";
import { fileURLToPath } from "url";
import { dirname, extname, join } from "path";
import uniqid from "uniqid"
import { getAuthors, saveAuthorsAvatars, writeAuthors } from "../../lib/fs-tools.js";
import multer from "multer";


const authorsRouter = Express.Router()
const authorsJSONPath = join(dirname(fileURLToPath(import.meta.url)), "authors.json")

// 1. GET all authors
authorsRouter.get("/", async (request, response) => {
    const authorsFile = await getAuthors()
    response.send(authorsFile)
})

// 2: POST new author
authorsRouter.post("/", async (request, response) => {
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
        console.log(error)
    }


})

// EXTRA 1
authorsRouter.post("/checkEmail", async (request, response) => {
    const authors = await getAuthors()

    const matchOrNot = authors.some(author => author.email === request.body.email)
    response.send(matchOrNot)
})

// 3. GET a specific author
authorsRouter.get("/:authorId", async (request, response) => {
    const authors = await getAuthors()

    const author = authors.find(author => author.ID === request.params.authorId)

    response.send(author)

})

// 4. PUT a specific author
authorsRouter.put("/:authorId", async (request, response) => {
    const authors = await getAuthors()
    const index = authors.findIndex(author => author.ID === request.params.authorId)
    const authorToUpdate = authors[index]
    const updatedAuthor = { ...authorToUpdate, ...request.body }
    authors[index] = updatedAuthor

    await writeAuthors(authors)

    response.send(updatedAuthor)
})

// 5. DELETE a specific author
authorsRouter.delete("/:authorId", async (request, response) => {
    const authors = await getAuthors()
    const newAuthors = authors.filter(author => author.ID !== request.params.authorId)

    await writeAuthors(newAuthors)

    response.status(204).send()
})



authorsRouter.post("/:authorId/uploadAvatar", multer().single("avatar"), async (request, response, next) => {
    try {
        const originalFileExtension = extname(request.file.originalname)
        const fileName = request.params.authorId + originalFileExtension
        await saveAuthorsAvatars(fileName, request.file.buffer)

        const authors = await getAuthors()
        const index = authors.findIndex(author => author.ID === request.params.authorId)
        const authorToUpdate = authors[index]
        const updatedAuthor = { ...authorToUpdate, avatar: `http://localhost:3001/images/authorAvatars/${fileName}` }
        authors[index] = updatedAuthor

        await writeAuthors(authors)

        response.send({ message: "Avatar uploaded" })

    } catch (error) {
        next(error)
    }
})

export default authorsRouter
