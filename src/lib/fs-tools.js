import fs from 'fs-extra'
import { fileURLToPath } from 'url'
import { join, dirname } from 'path'
import { createReadStream, createWriteStream } from 'fs'

const { readJSON, writeJSON, writeFile } = fs

const dataFolderPath = join(dirname(fileURLToPath(import.meta.url)), "../data")
const authorsJSONPath = join(dataFolderPath, "authors.json")
const postsJSONPath = join(dataFolderPath, "posts.json")

const authorsPublicFolderPath = join(process.cwd(), "./public/images/authorAvatars")
const postsPublicFolderPath = join(process.cwd(), "./public/images/postsCover")

export const getAuthors = () => readJSON(authorsJSONPath)
export const writeAuthors = (authorsArray) => writeJSON(authorsJSONPath, authorsArray)
export const saveAuthorsAvatars = (fileName, fileContent) => writeFile(join(authorsPublicFolderPath, fileName), fileContent)

export const getPosts = () => readJSON(postsJSONPath)
export const writePosts = (postsArray) => writeJSON(postsJSONPath, postsArray)
export const savePostsCovers = (fileName, fileContent) => writeFile(join(postsPublicFolderPath, fileName), fileContent)


export const getPostsJSONReadableStream = () => createReadStream(postsJSONPath)
export const getPDFWritableStream = filename => createWriteStream(join(dataFolderPath, filename))

export const getAuthorsJSONReadableStream = () => createReadStream(authorsJSONPath)