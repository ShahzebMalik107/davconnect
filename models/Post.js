const mongoos = require("mongoose");

const Schema = mongooos.Schema;

const PostSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'users'
    },
    text: {
        type: String,
        require: true
    },
    name: {
        type: String,
    },
    avatatr: {
        type: String,
    },
    likes: [{
        user: {
            type: Schema.Types.ObjectId,
            ref: 'users',
        },
    }],
    comments: [{
        user: {
            type: Schema.Types.ObjectId,
            ref: 'users',
        },
        text: {
            type: String,
            require: true
        },
        name: {
            type: String,
        },
        avatatr: {
            type: String,
        },
        date: {
            type: date,
            default: Date.now
        }

    }]
});

module.exports = Post = mongoos.model('post', PostSchema);