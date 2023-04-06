import Express from 'express'
import listEndpoints from 'express-list-endpoints'
import cors from 'cors'
import { badRequestErrorHandler, forbiddenErrorHandler, generalErrorHandler, notfoundErrorHandler, unauthorizedErrorHandler } from './errorHandlers.js'
import { join } from 'path'
import createHttpError from 'http-errors'
import filesRouter from './api/file/index.js'
import mongoose from 'mongoose'
import postsRouter from './api/blogPosts/mongoIndex.js'
import authorsRouter from './api/authors/mongoIndex.js'
import passport from 'passport'
import googleStrategy from './lib/auth/googleOAuth.js'


const server = Express()
const port = process.env.PORT
const publicFolderPath = join(process.cwd(), "./public")


passport.use("google", googleStrategy)



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
server.use(passport.initialize())

server.use("/authors", authorsRouter)
server.use("/blogPosts", postsRouter)
server.use("/file", filesRouter)

server.use(badRequestErrorHandler)
server.use(unauthorizedErrorHandler)
server.use(forbiddenErrorHandler)
server.use(notfoundErrorHandler)
server.use(generalErrorHandler)

mongoose.connect(process.env.MONGO_URL)
mongoose.connection.on("connected", () => {
    console.log("✅ DB Connected")
    server.listen(port, () => {
        console.table(listEndpoints(server))
        console.log("Server running in port: " + port)
    })
})

