const express = require('express')
const { findById } = require('../models/user')
const router = new express.Router()
const auth = require('../middleware/auth.js')
const User = require('../models/user')
const Task = require('../models/task')

router.post('/users', async (req,res)=>{
    const user = new User(req.body)

    try {
        await user.save()
        const token = await user.generateAuthToken()

        res.status(201).send({user,token: token})
    } catch (e) {
        res.status(400).send("Email already exists!")
    }
    /*user.save().then(()=>{
        res.status(201)
        res.send(user)
    }).catch((error)=>{
        res.status(400)
        res.send(error)
        // or we can chain
        // res.status(400).send(error)
    })*/
})

router.get('/users/me', auth, (req,res)=>{
    res.send(req.user)
})

router.post('/users/login', async (req,res)=>{
    try {
        const user = await User.findUserByCredentials(req.body.email,req.body.password);
        const token = await user.generateAuthToken()
        // res.send({user: user.getPublicProfile(),token})
        res.send({user,token})
    } catch (e) {
        console.log(e)
        res.status(400).send(e)
    }
})

router.post('/users/logout', auth, async (req,res)=>{
    try {
        req.user.tokens = req.user.tokens.filter((token)=>!(token.token === req.token))
        await req.user.save()
        res.send({status: "Succesfully logged out!"})
    } catch(e) {
        res.status(500).send()
    }
})

router.post('/users/logoutAll', auth, async (req,res)=>{
    try {
        req.user.tokens = []
        await req.user.save()
        res.send({status: "Succesfully logged out of All Sessions!"})
    } catch(e) {
        res.status(500).send()
    }
})

router.patch('/users/me', auth, async (req,res)=>{
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'age']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    try {

        updates.forEach((update) => req.user[update] = req.body[update]);
        await req.user.save()
        
        res.send(req.user)
    } catch(e) {
        res.status(400).send(e)
    }
})

router.delete('/users/me', auth, async (req,res)=>{
    try {
        // const user = await User.findByIdAndDelete(req.user._id)
        // res.send(user)

        // or we can use following 
        await Task.deleteMany({owner: req.user._id})
        await req.user.remove()
        res.send(req.user)
    } catch(e) {
        res.status(500).send(e)
    }
})

// Disabled below functionality because this is only used to test the database and the working of website
// uncomment it if wanted to test

/*router.patch('/users/:id', auth, async (req,res)=>{
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'age']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    try {
        const _id = req.params.id
        const user = await User.findByIdAndUpdate(_id,req.body,{new: true, runValidators: true})
        
        // // above one doesnt support middleware properly
        // // which will lead our password hashing fail so we are saving manually

        // const user = findById(_id)
        // updates.forEach((update) => user[update] = req.body[update]);
        // await user.save()
        
        if(!user) {
            res.status(404).send()
        }
        res.send(user)
    } catch(e) {
        res.status(400).send(e)
    }
})*/

// Disabled below functionality because this is only used to test the database and the working of website
// uncomment it if wanted to test

/*router.delete('/users/:id', async (req,res)=>{
    try {
        const _id = req.params.id
        const user = await User.findByIdAndDelete(_id)

        if(!user) {
            res.status(404).send()
        }
        res.send(user)
    } catch(e) {
        res.status(500).send(e)
    }
})*/

// Disabled below functionality because this is only used to test the database and the working of website
// uncomment it if wanted to test

/*router.get('/users', auth, (req,res)=>{
    User.find({}).then((users)=>{
        res.send(users)
    }).catch((error)=>{
        res.status(500).send(error)
    })
})*/

// Disabled below functionality because this is only used to test the database and the working of website
// uncomment it if wanted to test

/*router.get('/users/:id',(req,res)=>{
    const _id = req.params.id

    User.findById(_id).then((user)=>{
        if(!user) {
            return res.status(404).send()
        }

        res.send(user)
    }).catch((error)=>{
        res.status(500).send(error)
    })
})*/

module.exports = router