const express = require('express');
const router = express.Router();
const auth= require('../../midelware/auth');
const jwt = require('jsonwebtoken');
const config = require('config');
const check = require('express-validator').check;
const validationResult = require('express-validator').validationResult;
const bcrypt = require('bcryptjs');


const User = require('../../models/User');
//@route    GET api/auth
//@desc     Test Route
//@access   Public
router.get('/', auth , async (req, res) => {
    try{
        const user = await User.findById(req.user.id).select('-password');
        res.json(user)
    }
    catch(err){
        console.error(err.message);
        res.status(500).send('server error'); 
    }
});


//@route    POST api/auth 
//@desc     Authontacate User
//@access   Public

//adding valadation check for data
router.post('/', [
    check('email', 'please Include a valid Email').isEmail(),
    check('password', 'Password is required').exists(),
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
        email,
        password
    } = req.body;

    try {
        //If user Exist
        let user = await User.findOne({
            email
        });
        if (!user) {
            return res.status(400).json({
                errors: [{
                    msg: "Invalid cradantials"
                }]
            });
        }
        const isMatch =  await bcrypt.compare(password, user.password);
        
        if(!isMatch){
            return res.status(400).json({
                errors: [{
                    msg: "Invalid cradantials"
                }]
            });
        }


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

module.exports= router;