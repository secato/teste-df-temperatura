const express = require('express')
const cors = require('cors')
const axios = require('axios')
const dialogflow = require('dialogflow')
const app = express()
let config = undefined

if (process.env.NODE_ENV !== 'production')
    config = require('./config')

// APP CONFIG
const projectId = process.env.GOOGLE_PROJECT_ID || config.GOOGLE_PROJECT_ID
const client_email = process.env.GOOGLE_CLIENT_EMAIL || config.GOOGLE_CLIENT_EMAIL
const private_key = process.env.GOOGLE_PRIVATE_KEY || config.GOOGLE_PRIVATE_KEY
const weather_api_key = process.env.WEATHER_API_KEY || config.WEATHER_API_KEY

const port = process.env.PORT || 5001
const languageCode = 'pt-BR'

console.log(private_key)

const sessionClient = new dialogflow.SessionsClient({
    projectId,
    credentials: { client_email, private_key }
})

const sessionId = 'quickstart-session-id'
const session = sessionClient.sessionPath(projectId, sessionId)

const request = {
    session,
    queryInput: {
        text: {
            text: '',
            languageCode
        }
    }
}

app.use(cors())

app.get('/', (req, res) => {
    sessionClient
        .detectIntent({ session, queryInput: { text: { text: req.query.message, languageCode } } })
        .then(response => {
            if (response[0].queryResult.intent.displayName === 'temperatura') {
                const latitude = -20.8467
                const longtitude = -41.1202
                const api_url = `https://api.darksky.net/forecast/${weather_api_key}/${latitude},${longtitude}`
                console.log(api_url)
                axios.get(api_url)
                    .then(result => {
                        console.log(result)
                        const temperature = (result.data.currently.temperature - 32) / 1.8
                        const apparentTemperature = (result.data.currently.apparentTemperature - 32) / 1.8
                        response[0].queryResult.fulfillmentMessages.push(
                            {
                                platform: "PLATFORM_UNSPECIFIED",
                                text: {
                                    text: [
                                        `A temperatura em cachoeiro é de ${temperature.toFixed(2)}°C e 
                                        a temperatura aparente é de ${apparentTemperature.toFixed(2)}°C`
                                    ]
                                },
                                message: "text"
                            }
                        )
                        res.send(response[0].queryResult.fulfillmentMessages)
                    })
                    .catch(err => {
                        console.error(err)
                    })

            } else {
                res.send(response[0].queryResult.fulfillmentMessages)
            }
        })
        .catch(err => {
            console.error('ERROR:', err)
        })
})

app.listen(port, console.log(`Server started on port ${port}`))