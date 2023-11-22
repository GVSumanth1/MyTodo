const express = require('express')
const router = express.Router()

const auth = require('../middleware/auth.js')
const Task = require('../models/task.js')
const User = require('../models/user')
router.post('/tasks', auth, (req,res)=>{
    // const task = new Task(req.body)

    const task = new Task({
        ...req.body,
        owner: req.user._id
    })

    task.save().then(()=>{
        res.status(201).send(task)
    }).catch((error)=>{
        res.status(400).send(error)
    })
})

// router.get('/tasks', auth, async (req,res)=>{
//     const match = {owner: req.user._id}
//     if(req.query.completed) {
//         match.completed = req.query.completed === "true"
//     }
//     try {
//         const tasks = await Task.find(match)
//         res.send(tasks)
//     } catch(e) {
//         res.status(500).send(e)
//     }
//     // Task.find({}).then((tasks)=>{
//     //     res.send(tasks)
//     // }).catch((error)=>{
//     //     res.status(500).send(error)
//     // })
// })

router.get('/tasks', auth, async (req,res)=>{
    const match = {}
    const sort = {}
    if(req.query.completed) {
        match.completed = req.query.completed === "true"
    }

    if(req.query.sortBy) {
        const splits = req.query.sortBy.split(':')
        sort[splits[0]] = splits[1] === 'asc'? 1 : -1
        
    }
    try {
        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate()
        res.send(req.user.tasks)
    } catch(e) {
        res.status(500).send(e)
    }
    // Task.find({}).then((tasks)=>{
    //     res.send(tasks)
    // }).catch((error)=>{
    //     res.status(500).send(error)
    // })
})

router.get('/tasks/:id', auth, async (req,res)=>{
    const _id = req.params.id

    try {
        const task = await Task.findOne({_id, owner: req.user._id})

        if(!task) {
            return res.status(404).send()
        }

        res.send(task)
    } catch(e) {
        res.status(500).send(e)
    }
})

router.patch('/tasks/:id', auth, async (req,res)=>{
    const updates = Object.keys(req.body)
    const allowedUpdates = ['description', 'completed']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    try {
        const _id = req.params.id

        const task = await Task.findOne({_id,owner:req.user._id})
        
        if(!task) {
            res.status(404).send()
        }

        updates.forEach((update) => { 
            task[update] = req.body[update] 
        })

        await task.save()
        res.send(task)
    } catch(e) {
        res.sendStatus(400)
    }
})

router.delete('/tasks/:id', auth, async (req,res)=>{
    try {
        const _id = req.params.id
        const task = await Task.findOneAndDelete({_id, owner: req.user._id})

        if(!task) {
            res.status(404).send()
        }

        res.send(task)
    } catch(e) {
        res.status(500).send(e)
    }
})

// Disabled below functionality because this is only used to test the database and the working of website
// uncomment it if wanted to test

/*router.get('/tasks/:id', auth,(req,res)=>{
    const _id = req.params.id

    Task.findById(_id).then((task)=>{
        if(!task) {
            return res.status(404).send()
        }

        res.send(task)
    }).catch((error)=>{
        res.status(500).send(error)
    })
})*/

module.exports = router