const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const app = express()

const port = process.env.PORT || 5000

app.use(cors())
app.use(bodyParser.urlencoded({ extended: true }))

app.post('/dialogflow', (req, res) => {
    console.log(req)
})

app.listen(port, console.log(`Server started listening on ${port}`))

