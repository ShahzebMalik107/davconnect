const express = require('express');
const router = express.Router();
const auth = require("../../midelware/auth");
const Porfile = require("../../models/profile");
const User = require("../../models/User");
const check = require('express-validator').check;
const validationResult = require('express-validator').validationResult;
const request = require('request');
const config = require('config');


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

//@route    GET api/profile/
//@desc     Get all profile
//@access   Public
router.get('/', async (req, res) => {
    try {
        const profiles = await Porfile.find().populate('user', ['name', 'avatar']);
        res.json(profiles);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('server error');
    }
});

//@route    GET api/profile/user/:user_id
//@desc     Get profile by id 
//@access   Public
router.get('/user/:user_id', async (req, res) => {
    try {
        const profile = await Porfile.findOne({
            user: req.params.user_id
        }).populate('user', ['name', 'avatar']);
        if (!profile) return res.status(400).json({
            msg: 'no profile found'
        });
        res.json(profile);
    } catch (err) {
        console.error(err.message);
        if (err.kind == 'objectId') {
            return res.status(400).json({
                msg: 'no profile found'
            });
        }
        res.status(500).send('server error');
    }
});

//@route    DELETE api/profile
//@desc     Delete Profile, user and post
//@access   Public
router.delete('/', auth, async (req, res) => {
    try {
        //remove profile
        await Porfile.findOneAndRemove({
            user: req.user.id
        });

        //remove user 
        await User.findOneAndRemove({
            user: req.user.id
        });
        res.json({
            msg: 'user removed'
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('server error');
    }
});

//@route    PUT api/profile/experience
//@desc     Adding profile experience
//@access   Private

router.put('/experience', [auth, [
    check('title', 'Title is required').not().isEmpty(),
    check('company', 'company is required').not().isEmpty(),
    check('from', 'From date is required').not().isEmpty(),
]], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        });
    }

    const {
        title,
        company,
        location,
        from,
        to,
        current,
        description
    } = req.body;

    const newExp = {
        title,
        company,
        location,
        from,
        to,
        current,
        description
    }

    try {
        const profile = await Porfile.findOne({
            user: req.user.id
        });
        profile.experience.unshift(newExp);
        await profile.save();

        res.json(profile);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('server error');
    }
})


//@route    DELETE pi/profile/experience:exp_id
//@desc     Delete Experience
//@access   private
router.delete('/experience/:exp_id', auth, async (req, res) => {
    try {
        const profile = await Porfile.findOne({
            user: req.user.id
        });
        // Get the remove idex
        const removeIndex = profile.experience.map(item => item.id).indexOf(req.params.exp_id);
        profile.experience.splice(removeIndex, 1);
        await profile.save();
        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('server error');
    }
});


//@route    PUT api/profile/education
//@desc     Adding profile education
//@access   Private

router.put('/education', [auth, [
    check('insitute', 'insitute is required').not().isEmpty(),
    check('degree', 'degree is required').not().isEmpty(),
    check('fieldofstudy', 'fieldofstudy is required').not().isEmpty(),
    check('from', 'From date is required').not().isEmpty(),
]], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        });
    }

    const {
        insitute,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description
    } = req.body;

    const newEdu = {
        insitute,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description
    }

    try {
        const profile = await Porfile.findOne({
            user: req.user.id
        });
        profile.education.unshift(newEdu);
        await profile.save();

        res.json(profile);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('server error');
    }
})


//@route    DELETE api/profile/education:edu_id
//@desc     Delete education
//@access   private
router.delete('/education/:edu_id', auth, async (req, res) => {
    try {
        const profile = await Porfile.findOne({
            user: req.user.id
        });
        // Get the remove idex
        const removeIndex = profile.experience.map(item => item.id).indexOf(req.params.edu_id);
        profile.education.splice(removeIndex, 1);
        await profile.save();
        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('server error');
    }
});

//@route    GET api/profile/guthub:username
//@desc     Getting github repo
//@access   Public

router.get('/github/:username', (req, res) => {
    try {
        const options = {
            uri: `https://api.github.com/users/${req.params.username}/repos?per_page=5&created:asc&id=${config.get('githubClientID')}&client_secret=${config.get('githubSeceret')}`,
            method: 'GET',
            headers: {
                'user-agent': 'node.js'
            }
        };
        request(options, (error,response, body)=>{
            if(error) console.error(error);

            if(response.statusCode !==200){
                return res.status(404).json({
                    msg:"no github profile found"
                });
            }

            res.json(JSON.parse(body));
        })
    } catch (err) {
        console.error(err.message);
        res.status(500).send('server error');
    }
})




module.exports = router;