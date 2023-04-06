import GoogleStrategy from 'passport-google-oauth20'
import AuthorsModel from "../../api/authors/model.js"
import { createAccessToken } from './tools.js'


const googleStrategy = new GoogleStrategy({
    clientID: process.env.GOOGLE_ID,
    clientSecret: process.env.GOOGLE_SECRET,
    callbackURL: `${process.env.API_URL}/authors/auth/google/callback`
},
    async (_, __, profile, passportNext) => {
        try {
            const { sub, given_name, family_name, email } = profile._json
            const author = await AuthorsModel.findOne({ email })
            if (author) {
                const accessToken = await createAccessToken({ _id: author._id, role: author.role })
                passportNext(null, { accessToken })
            } else {
                const newAuthor = new AuthorsModel({
                    name: given_name,
                    surname: family_name,
                    email,
                    googleId: sub
                })

                const savedNewAuthor = await newAuthor.save()
                const accessToken = await createAccessToken({ _id: savedNewAuthor._id, role: savedNewAuthor.role })
                passportNext(null, { accessToken })

            }
        } catch (error) {
            passportNext(error)
        }
    })



export default googleStrategy