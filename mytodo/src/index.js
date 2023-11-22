const express = require('express')
require('./db/mongoose')
const User = require('./models/user')
const Task = require('./models/task')

const userRouter = require('./routers/users.js')
const taskRouter = require('./routers/tasks.js')

const app = express()
const port = process.env.PORT 


app.use(express.json())

app.use(express.Router())
app.use(userRouter)
app.use(taskRouter)

app.get('/',(req,res)=>{
    res.send('hello')
})

app.listen(port,()=>{
    console.log("server started succesfully on port: ",port)
})