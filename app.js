const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const { WebhookClient, Card, Suggestion } = require('dialogflow-fulfillment')
const axios = require('axios')
const app = express()

const wikipediaTemperatureUrl = 'https://en.wikipedia.org/wiki/Temperature';
const wikipediaTemperatureImageUrl = 'https://upload.wikimedia.org/wikipedia/commons/2/23/Thermally_Agitated_Molecule.gif'
const weather_api_key = process.env.WEATHER_API_KEY || config.WEATHER_API_KEY

const port = process.env.PORT || 5000

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cors())

// default url para o webhook
app.post('/dialogflow', (request, response) => {
    // console.log(req.body)
    // req.body.queryResult.fulfillmentText = 'Oi, eu fui alterado via webhook'
    // res.send(req.body)
    const agent = new WebhookClient({ request, response })



    function welcome(agent) {
        agent.add('Meu webhook favorito')

    }

    function fallback(agent) {
        agent.add(`I didn't understand`);
        agent.add(`I'm sorry, can you try again?`);

    }

    async function temperatura(agent) {
        const latitude = -20.8467
        const longtitude = -41.1202
        const api_url = `https://api.darksky.net/forecast/${weather_api_key}/${latitude},${longtitude}`
        console.log(api_url)

        const result = await axios.get(api_url)
        const temperature = (result.data.currently.temperature - 32) / 1.8
        console.log(agent.consoleMessages)
        let messages = agent.consoleMessages.map(message => message.Text.text)
        messages.push(`A temperatura agora em cachoeiro é de ${temperature.toFixed(2)} graus celsius.`)
        console.log(messages)
        agent.add(messages)

        // axios.get(api_url)
        //     .then(result => {

        //         const apparentTemperature = (result.data.currently.apparentTemperature - 32) / 1.8

        //         response.json({ fulfillmentText: `A temperatura atual em cachoeiro é de ${temperature}` })
        //         // agent.add(`Welcome to the temperature converter!`);
        //         // agent.add(new Card({
        //         //     title: `Vibrating molecules`,
        //         //     imageUrl: wikipediaTemperatureImageUrl,
        //         //     text: `Did you know that temperature is really just a measure of how fast molecules are vibrating around?! 😱`,
        //         //     buttonText: 'Temperature Wikipedia Page',
        //         //     buttonUrl: wikipediaTemperatureUrl
        //         // })
        //         // );
        //         // agent.add(`I can convert Celsuis to Fahrenheit and Fahrenheit to Celsius! What temperature would you like to convert?`);
        //         // agent.add(new Suggestion(`27° Celsius`));
        //         // agent.add(new Suggestion(`-40° Fahrenheit`));
        //         // agent.add(new Suggestion(`Cancel`));
        //     }).catch(err => console.error(err))

    }

    let intentMap = new Map();
    intentMap.set('Default Welcome Intent', welcome);
    intentMap.set('Default Fallback Intent', fallback);
    intentMap.set('temperatura', temperatura);
    // intentMap.set('<INTENT_NAME_HERE>', googleAssistantHandler);
    agent.handleRequest(intentMap);
})

app.listen(port, console.log(`Server started listening on ${port}`))


