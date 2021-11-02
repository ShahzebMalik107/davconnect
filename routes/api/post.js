const express = require('express');
const router = express.Router();
const check = require('express-validator').check;
const validationResult = require('express-validator').validationResult;
const auth = require("../../midelware/auth");
const Post = require("../../models/Post");
const User = require("../../models/User");
const Profile = require("../../models/profile");

//@route    POST api/post
//@desc     Test Route
//@access   Private
router.post('/', [auth, [
    check('text', 'text is requrie').not().isEmpty(),
]], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        });
    }
    try {
        const user = await User.findById(req.user.id).select('-password');

        const newPost = new Post({
            text: req.body.text,
            name: user.name,
            avatar: user.avatar,
            user: req.user.id
        });

        const post = await newPost.save();

        res.json(post);
    } catch (err) {
        console.error(err.message);
        res.status(400).json({
            msg: "server error"
        })
    }

});

module.exports = router;