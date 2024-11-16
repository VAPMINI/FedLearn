const express = require('express')
const app = express()
const fileUpload = require('express-fileupload');
app.use(fileUpload({
    limits: { fileSize: 1024 * 1024 * 1024 }, // 1GB limit
    useTempFiles: true,
    tempFileDir: '/tmp/'
  }));
const cors = require('cors')
app.use(cors())
app.use(express.json())
const db = require('./db/db')
db()


const authRoutes = require('./routes/authRoutes')
const projectRoutes = require('./routes/projectRoutes')

app.use('/auth',authRoutes)
app.use('/project',projectRoutes)

app.get('/ping',(req, res)=>{
    res.send('PONG')
})


app.listen(process.env.PORT, ()=>{
    console.log(`Server running at port ${process.env.PORT}`)
})
