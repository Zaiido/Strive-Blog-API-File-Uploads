import fs from 'fs-extra'
import { fileURLToPath } from 'url'
import { join, dirname } from 'path'

const { readJSON, writeJSON, writeFile } = fs

const dataFolderPath = join(dirname(fileURLToPath(import.meta.url)), "../data")
const authorsPath = join(dataFolderPath, "authors.json")
const postsPath = join(dataFolderPath, "posts.json")

const authorsPublicFolderPath = join(process.cwd(), "./public/images/authorAvatars")
const postsPublicFolderPath = join(process.cwd(), "./public/images/postsCover")

export const getAuthors = () => readJSON(authorsPath)
export const writeAuthors = (authorsArray) => writeJSON(authorsPath, authorsArray)
export const saveAuthorsAvatars = (fileName, fileContent) => writeFile(join(authorsPublicFolderPath, fileName), fileContent)

export const getPosts = () => readJSON(postsPath)
export const writePosts = (postsArray) => writeJSON(postsPath, postsArray)
export const savePostsCovers = (fileName, fileContent) => writeFile(join(postsPublicFolderPath, fileName), fileContent)
