const express = require('express')
const cors = require('cors')
const app = express()

const port = process.env.PORT || 5000

app.use(cors())

app.post('/dialogflow', (req, res) => {
    console.log(req.body)
})

app.listen(port, console.log(`Server started listening on ${port}`))

