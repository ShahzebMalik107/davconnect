const express = require('express');
const router = express.Router();
const check = require('express-validator').check;
const validationResult = require('express-validator').validationResult;
const auth = require("../../midelware/auth");
const Post = require("../../models/Post");
const User = require("../../models/User");
const Profile = require("../../models/profile");

//@route    POST api/post
//@desc     Adding a new post
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
//@route    GET api/post
//@desc     Get All POST
//@access   Private

router.get('/', auth, async (req, res) => {
    try {
        const posts = await Post.find().sort({
            date: -1
        });
        res.json(posts);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("server error")
    }
});

//@route    GET api/post:id
//@desc     Get Post by ID
//@access   Private

router.get('/:id', auth, async (req, res) => {
    try {
        const posts = await Post.findById(req.params.id);

        if (!posts) {
            return res.status(404).json({
                msg: "post not found"
            });
        }
        res.json(posts);
    } catch (err) {
        if (err.kind === 'ObjectId') {
            return res.status(404).json({
                msg: "post not found"
            });
        }
        console.error(err.message);
        res.status(500).send("server error")
    }
});

//@route    Delet api/post:id
//@desc     Delete Post by ID
//@access   Private

router.delete('/:id', auth, async (req, res) => {
    try {
        const posts = await Post.findById(req.params.id);

        //check on user
        if (posts.user.toString() !== req.user.id) {
            return res.status(401).json({
                msg: 'User not authorized'
            });
        }
        await posts.remove();

        if (!posts) {
            return res.status(404).json({
                msg: "post not found"
            });
        }
        res.json({
            msg: "post removed"
        });
    } catch (err) {
        if (err.kind === 'ObjectId') {
            return res.status(404).json({
                msg: "post not found"
            });
        }
        console.error(err.message);
        res.status(500).send("server error")
    }
});

//@route    PUT api/post/like/:id
//@desc     Like a Post by ID
//@access   Private
router.put('/like/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (post.likes.filter(likes => likes.user.toString() === req.user.id).length > 0) {
            return res.status(400).json({
                msg: 'post liked'
            })
        }
        post.likes.unshift({
            user: req.user.id
        });

        await post.save();
        ``
        res.json(post.likes)
    } catch (err) {
        console.error(err.message);
        res.status(500).send("server error")
    }
});

//@route    PUT api/post/likeun/:id
//@desc     UNLike a Post by ID
//@access   Private
router.put('/unlike/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (post.likes.filter(likes => likes.user.toString() === req.user.id).length === 0) {
            return res.status(400).json({
                msg: 'post has not yet bin liked'
            })
        }
        const removeindex = post.likes.map(like => like.user.toString()).indexOf(req.user.id);
        post.likes.splice(removeindex, 1);

        await post.save();
        
        res.json(post.likes)
    } catch (err) {
        console.error(err.message);
        res.status(500).send("server error")
    }
});

module.exports = router;