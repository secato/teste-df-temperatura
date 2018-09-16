const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const { WebhookClient, Card, Suggestion } = require('dialogflow-fulfillment')
const app = express()

const wikipediaTemperatureUrl = 'https://en.wikipedia.org/wiki/Temperature';
const wikipediaTemperatureImageUrl = 'https://upload.wikimedia.org/wikipedia/commons/2/23/Thermally_Agitated_Molecule.gif'

const port = process.env.PORT || 5000

app.use(cors())
app.use(bodyParser.json())

// default url para o webhook
app.post('/dialogflow', (req, res) => {
    // console.log(req.body)
    // req.body.queryResult.fulfillmentText = 'Oi, eu fui alterado via webhook'
    // res.send(req.body)
    const agent = new WebhookClient({ req, res })

    function welcome(agent) {
        agent.add('Meu webhook favorito')
    }

    function fallback(agent) {
        agent.add(`I didn't understand`);
        agent.add(`I'm sorry, can you try again?`);
    }

    function temperatura(agent) {
        agent.add(`Welcome to the temperature converter!`);
        agent.add(new Card({
            title: `Vibrating molecules`,
            imageUrl: wikipediaTemperatureImageUrl,
            text: `Did you know that temperature is really just a measure of how fast molecules are vibrating around?! 😱`,
            buttonText: 'Temperature Wikipedia Page',
            buttonUrl: wikipediaTemperatureUrl
        })
        );
        agent.add(`I can convert Celsuis to Fahrenheit and Fahrenheit to Celsius! What temperature would you like to convert?`);
        agent.add(new Suggestion(`27° Celsius`));
        agent.add(new Suggestion(`-40° Fahrenheit`));
        agent.add(new Suggestion(`Cancel`));
    }

    let intentMap = new Map();
    intentMap.set('Default Welcome Intent', welcome);
    intentMap.set('Default Fallback Intent', fallback);
    intentMap.set('temperatura', temperatura);
    // intentMap.set('<INTENT_NAME_HERE>', googleAssistantHandler);
    agent.handleRequest(intentMap);
})

app.listen(port, console.log(`Server started listening on ${port}`))


