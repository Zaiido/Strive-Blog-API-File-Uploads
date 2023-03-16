import mongoose from "mongoose";

const { Schema, model } = mongoose

const postSchema = new Schema({
    category: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    cover: {
        type: String,
        required: true
    },
    readTime: {
        value: {
            type: Number,
            required: true
        },
        unit: {
            type: String,
            enum: {
                values: ['minute', 'minutes', 'hour', 'hours', 'day'],
                message: 'Read time unit is required and must be either minute, hour, or day',
            },
            required: true
        },
    },
    authors: [{ type: Schema.Types.ObjectId, ref: "Author" }],
    content: {
        type: String,
        required: true
    },
    comments: [
        {
            "author": String,
            "comment": String,
            "createdAt": Date,
            "updatedAt": Date
        }
    ],
    likes: [
        { type: Schema.Types.ObjectId, ref: "Author" }
    ]
}, { timestamps: true })

postSchema.static("findBlogs", async function (query) {
    const blogs = await this.find(query.criteria, query.options.fields)
        .skip(query.options.skip)
        .limit(query.options.limit)
        .sort(query.options.sort)
    const totalDocuments = await this.countDocuments(query.criteria)
    return { blogs, totalDocuments }
})

export default model("BlogPost", postSchema)