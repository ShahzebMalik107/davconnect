const express = require('express');
const router = express.Router();
const auth = require("../../midelware/auth");
const Porfile = require("../../models/profile");
const User = require("../../models/User");
const check = require('express-validator').check;
const validationResult = require('express-validator').validationResult;


//@route    GET api/profile/me
//@desc     Get Current User Profile
//@access   Private
router.get('/me', auth, async (req, res) => {
    try {
        const profile = await Porfile.findOne({
            user: req.user.id
        }).populate('user', ['name', 'avatar']);

        if (!profile) {
            return res.status(400).json({
                msg: 'there is no prfile for this user'
            });
        }
        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("server error")
    }
});


//@route    POST api/profile/
//@desc     Create or update user profile
//@access   Private

router.post('/', [auth, [
    check('status', 'status is required').not().isEmpty(),
    check('skills', 'Skills are required').not().isEmpty()

]], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        });
    }
    const {
        company,
        websites,
        location,
        bio,
        status,
        githubusername,
        skills,
        youtube,
        facebook,
        twitter,
        instagram,
        linkdin,
    } = req.body;

    //Build profile object
    const profilefields = {};
    profilefields.user = req.user.id;
    if (company) profilefields.company = company;
    if (websites) profilefields.websites = websites;
    if (location) profilefields.location = location;
    if (bio) profilefields.bio = bio;
    if (status) profilefields.status = status;
    if (githubusername) profilefields.githubusername = githubusername;
    if (skills) {
        profilefields.skills = skills.split(',').map(skill => skill.trim());
    }

    //Build socialmedia object

    profilefields.social = {};
    if (youtube) profilefields.social.youtube = youtube;
    if (facebook) profilefields.social.facebook = facebook;
    if (twitter) profilefields.social.twitter = twitter;
    if (linkdin) profilefields.social.linkdin = linkdin;
    if (instagram) profilefields.social.instagram = instagram;


    try {
        let profile = await Porfile.findOne({
            user: req.user.id
        });
        if (profile) {
            // update
            profile = await Porfile.findOneAndUpdate({
                user: req.user.id
            }, {
                $set: profilefields
            }, {
                new: true
            });
            return res.json(profile);
        }

        //create

        profile = new Porfile(profilefields);
        await profile.save();

        res.json(profile)
    } catch (err) {
        console.error(err.message);
        res.status(400).json({
            msg: "server error"
        })
    }

});



module.exports = router;