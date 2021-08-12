//dep
const express = require('express')
const fileUpload = require('express-fileupload');

const usersRoutes = require('./routes/users')
const classesRoutes = require('./routes/classes')
const projectsRoutes = require('./routes/projects')
const mediaRoutes = require('./routes/media')

//init
require('dotenv').config()
const app = express()

//middleware
app.use(express.json())
app.use(fileUpload({
    createParentPath: true,
    limits: { fileSize: 100 * 1024 * 1024 },
}))
app.use(express.static('public'))
app.use('/api/users', usersRoutes)
app.use('/api/classes', classesRoutes)
app.use('/api/projects', projectsRoutes)
app.use('/api/media', mediaRoutes)


app.get('*', (req, res) => {
    res.status(404).json({
        message: "Error link not found"
    })
})

const PORT = process.env.PORT

app.listen(PORT, () => console.log('we are running on PORT: ' + PORT))

