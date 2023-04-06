import mongoose from "mongoose";
import bcrypt from 'bcrypt'

const { Schema, model } = mongoose


const authorSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    surname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    avatar: {
        type: String,
        default: "https://cdn-icons-png.flaticon.com/512/3177/3177440.png"
    },
    password: {
        type: String,
        required: false // Create an Express Validation to handle this
    },
    role: {
        type: String,
        default: "User",
        enum: ["Admin", "User"]
    },
    googleId: {
        type: String
    }

}, { timestamps: true })


authorSchema.pre("save", async function () {
    const newAuthorData = this

    if (newAuthorData.isModified("password")) { // This doesn't update password as hash, but as plain text
        const plainPW = newAuthorData.password

        const hash = await bcrypt.hash(plainPW, 11)
        newAuthorData.password = hash
    }
})


authorSchema.methods.toJSON = function () {
    // This .toJSON method is called EVERY TIME Express does a response.send(Author/Authors)
    // This does mean that we could override the default behaviour of this method, by writing some code that removes passwords 
    // (and also some unnecessary things as well) from Authors
    const currentAuthorDocument = this
    const currentAuthor = currentAuthorDocument.toObject()
    delete currentAuthor.password
    delete currentAuthor.createdAt
    delete currentAuthor.updatedAt
    delete currentAuthor.__v
    return currentAuthor
}


authorSchema.static("checkCredentials", async function (email, plainPW) {

    const author = await this.findOne({ email })
    if (author) {

        const passwordMatch = await bcrypt.compare(plainPW, author.password)

        if (passwordMatch) {
            return author
        } else {
            return null
        }
    } else {
        return null
    }
})


export default model("Author", authorSchema)