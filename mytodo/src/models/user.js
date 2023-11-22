const mongoose = require('mongoose')
const validator = require('validator')
const Task = require('./task')
const bcrypt = require('bcryptjs')
const jwt = require("jsonwebtoken")

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        unique: true,
        type: String,
        validate(value) {
            if(!validator.isEmail(value)) {
                throw new Error('Please use a valid email address')
            }
        },
        trim: true,
        lowercase: true,
        required: true
    },
    password: {
        type: String,
        required: true,
        trim: true,
        validate(pass) {
            if(pass.length <= 6) {
                throw new Error('Password should contain atleast 7 characters')
            }
            else if(pass.toLowerCase().includes('password')) {
                throw new Error('Password should not contain the word "password"')
            }
        }
    },
    age: {
        type: Number,
        default: 0,
        validate(value) {
            if(value < 0) {
                throw new Error("cannot have negative age")
            }
        }
    },
    tokens: [{
        token : {
            type: String,
            required: true
        }
    }]
},{
    timestamps: true
})

userSchema.virtual('tasks',{
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
})

userSchema.methods.generateAuthToken = async function() {
    const user = this
    const token = jwt.sign({_id: user._id.toString()}, process.env.JWT_SECRET)
    user.tokens = user.tokens.concat({token})
    await user.save()
    return token
}

userSchema.methods.toJSON = function(){
    const user = this
    const data = user.toObject()

    delete data.password
    delete data.tokens

    return data
}

// Changing below functio to toJSON because every time JSON.stringify runs on the user
// toJSON function will also run on it hence below calling below function again and again is same as declaring
// it as toJSON function

// userSchema.methods.getPublicProfile  = function(){
//     const user = this
//     const data = user.toObject()

//     delete data.password
//     delete data.tokens
    
//     return data
// }

userSchema.statics.findUserByCredentials = async (email,password) =>{

    const user = await User.findOne({email})

    if(!user) {
        throw new Error("Invalid Credentials")
    }

    const isMatch = await bcrypt.compare(password,user.password)

    if(!isMatch) {
        throw new Error("Invalid Credentials")
    }

    return user
}

userSchema.pre('save', async function(next) {
    const user = this;

    if(user.isModified('password')) {
        user.password = await bcrypt.hash(user.password,8);
    }

    next()
})

const User = mongoose.model('User', userSchema);

module.exports = User