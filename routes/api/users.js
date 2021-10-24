const express = require('express');
const router = express.Router();
const check = require('express-validator').check;
const validationResult = require('express-validator').validationResult;
const gravatar = require('gravatar');
const User = require('../../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');

//@route    POST api/users
//@desc     Register User
//@access   Public

//adding valadation check for data
router.post('/', [
        check('name', 'Name is Required').not().isEmpty(),
        check('email', 'please Include a valid Email').isEmail(),
        check('password', 'Plase Enter password with 6 or more chracters').isLength({
            min: 6
        })
    ],
    async (req, res) => {
        // console.log(req.body);

        //checking valadation Erros

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array()
            });
        }

        //Destructuring request

        const {
            name,
            email,
            password
        } = req.body;

        try {
            //If user Exist
            let user = await User.findOne({
                email
            });
            if (user) {
                return res.status(400).json({
                    errors: [{
                        msg: "User Alrady Exist"
                    }]
                });
            }
            //Get user Gravatar

            const avatar = gravatar.url(email, {
                s: '200',
                r: 'pg',
                d: 'mm'
            })

            user = new User({
                name,
                email,
                avatar,
                password
            });
            //Encrypt password

            const salt = await bcrypt.genSalt(10);

            user.password = await bcrypt.hash(password, salt);

            await user.save();
            //Return Json Webtoken 
            const payload = {
                user: {
                    id: user.id
                }
            }

            jwt.sign(payload, config.get('jwtSecret'), {
                expiresIn: 360000
            }, (err, token)=>{
                if(err) throw(err)
                res.json({token});
            });
        } catch (err) {
            console.error(err.message);
            res.status(500).send('server error');
        }


    });

module.exports = router;