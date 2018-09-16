const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const app = express()

const port = process.env.PORT || 5000

app.use(cors())
app.use(bodyParser.json())

app.post('/dialogflow', (req, res) => {
    console.log(req.body)
    res.send('hi')
})

app.listen(port, console.log(`Server started listening on ${port}`))

