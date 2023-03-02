import Express from 'express'
import listEndpoints from 'express-list-endpoints'
import cors from 'cors'
import { badRequestHandler, generalErrorHandler, notfoundHandler } from './errorHandlers.js'
import authorsRouter from './api/authors/index.js'
import postsRouter from './api/blogPosts/index.js'
import { join } from 'path'


const server = Express()
const port = 3001
const publicFolderPath = join(process.cwd(), "./public")

server.use(cors())
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