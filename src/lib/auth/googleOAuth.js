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
            // 1. Check if the author is already in db
            const author = await AuthorsModel.findOne({ email })
            if (author) {
                // 2. If he is there --> generate an accessToken 
                const accessToken = await createAccessToken({ _id: author._id, role: author.role })
                // 2.1 Then we can go next (to /auth/google/callback route handler function)
                passportNext(null, { accessToken })
            } else {
                // 3. If author is not in our db --> create that
                const newAuthor = new AuthorsModel({
                    name: given_name,
                    surname: family_name,
                    email,
                    googleId: sub
                })

                const savedNewAuthor = await newAuthor.save()
                // 3.1 Then generate an accessToken
                const accessToken = await createAccessToken({ _id: savedNewAuthor._id, role: savedNewAuthor.role })
                // 3.2 Then we go next (to /auth/google/callback  route handler function)
                passportNext(null, { accessToken })

            }
        } catch (error) {
            // 4. In case of errors we gonna catch'em and handle them
            passportNext(error)
        }
    })



export default googleStrategy