const mongoos = require("mongoose");

// const Schema = mongoos.Schema;

const PostSchema = new mongoos.Schema({
    user: {
        type: mongoos.Schema.Types.ObjectId,
        ref: 'user'
    },
    text: {
        type: String,
        require: true
    },
    name: {
        type: String,
    },
    avatar: {
        type: String,
    },
    likes: [{
        user: {
            type: mongoos.Schema.Types.ObjectId,
            ref: 'user'
        },
    }],
    comments: [{
        user: {
            type: mongoos.Schema.Types.ObjectId,
            ref: 'user'
        },
        text: {
            type: String,
            require: true
        },
        name: {
            type: String,
        },
        avatar: {
            type: String,
        },
        date: {
            type: Date,
            default: Date.now
        },
    }]
});

module.exports = Post = mongoos.model('post', PostSchema);