const mongoos = require("mongoose");

const profileschema = new mongoos.Schema({
    user: {
        type: mongoos.Schema.Types.ObjectId,
        ref: 'user'
    },
    company: {
        type: String
    },
    websites: {
        type: String
    },
    location: {
        type: String
    },
    status: {
        type: String,
        require: true
    },
    skills: {
        type: [String],
        require: true
    },
    bio: {
        type: String
    },
    githubusername: {
        type: String
    },
    experience: [{
        title: {
            type: String,
            require: true
        },
        company: {
            type: String,
            require: true
        },
        location: {
            type: String
        },
        from: {
            type: Date,
            require: true
        },
        to: {
            type: Date
        },
        current: {
            type: Boolean,
            default: false
        },
        description: {
            type: String
        }
    }],
    education: [{
        insitute: {
            type: String,
            require: true
        },
        degree: {
            type: String,
            require: true
        },
        fieldofstudy: {
            type: String,
            require: true
        },
        from: {
            type: Date,
            require: true
        },
        to: {
            type: Date
        },
        current: {
            type: Boolean,
            default: false
        },
        description: {
            type: String
        }
    }],
    social: {
        youtube: {
            type: String
        },
        facebook: {
            type: String
        },
        twitter: {
            type: String
        },
        linkdin: {
            type: String
        },
        instagram: {
            type: String,
        }
    },
    data: {
        type: Date,
        default: Date.now
    }
});

module.exports= Profile=mongoos.model('profile', profileschema);