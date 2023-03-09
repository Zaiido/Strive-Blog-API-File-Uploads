import Express, { response } from "express";
import { getAuthorsJSONReadableStream, getPostsJSONReadableStream } from "../../lib/fs-tools.js";
import { Transform } from '@json2csv/node'
import { pipeline } from "stream";

const filesRouter = Express.Router()

// POSTS CSV FILE

filesRouter.get("/csvPosts", (request, response, next) => {
    try {
        response.setHeader("Content-Disposition", "attachment; filename=posts.csv")
        const source = getPostsJSONReadableStream()
        const transform = new Transform({ fields: ["_id", "title", "author.name"] })
        const destination = response
        pipeline(source, transform, destination, error => {
            if (error) console.log(error)
        })
    } catch (error) {
        next(error)
    }
})


// AUTHORS CSV FILE

filesRouter.get("/csvAuthors", (request, response, next) => {
    try {
        response.setHeader("Content-Disposition", "attachment; filename=authors.csv")
        const source = getAuthorsJSONReadableStream()
        const transform = new Transform({ fields: ["ID", "name", "surname", "email", "date of birth", "avatar"] })
        const destination = response
        pipeline(source, transform, destination, error => {
            if (error) console.log(error)
        })

    } catch (error) {
        next(error)
    }
})

export default filesRouter