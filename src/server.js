import Express from 'express'
import listEndpoints from 'express-list-endpoints'
import cors from 'cors'
import { badRequestHandler, generalErrorHandler, notfoundHandler } from './errorHandlers.js'
import authorsRouter from './api/authors/index.js'
import postsRouter from './api/blogPosts/index.js'
import { join } from 'path'
import createHttpError from 'http-errors'


const server = Express()
const port = process.env.PORT
const publicFolderPath = join(process.cwd(), "./public")

const whitelist = [process.env.FE_DEV_URL, process.env.FE_PROD_URL]
server.use(cors({
    origin: (currentOrigin, corsNext) => {
        if (!currentOrigin || whitelist.indexOf(currentOrigin) !== -1) {
            corsNext(null, true)
        } else {
            corsNext(createHttpError(400, `Origin ${currentOrigin} is not in the whitelist!`))
        }
    }
}))
server.use(Express.static(publicFolderPath))
server.use(Express.json())

server.use("/authors", authorsRouter)
server.use("/blogPosts", postsRouter)

server.use(badRequestHandler)
server.use(notfoundHandler)
server.use(generalErrorHandler)

server.listen(port, () => {
    console.table(listEndpoints(server))
    console.log("Server running in port: " + port)
})