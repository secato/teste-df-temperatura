const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const { WebhookClient, Payload, Text } = require('dialogflow-fulfillment')
const axios = require('axios')
const app = express()

// chave de acesso da API
const weather_api_key = process.env.WEATHER_API_KEY || config.WEATHER_API_KEY

// porta
const port = process.env.PORT || 5000

// config do express
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cors())

// default url para o webhook
app.post('/dialogflow', (request, response) => {
    const agent = new WebhookClient({ request, response })

    // retorna uma mensagem mais detalhad asobre o clima de hoje
    async function clima(agent) {

        // note que as coordenadas de latitude e longitude estao fixas na url, o ideal era pegar de um servico de geolocalizacao para ficar dinamico
        const api_url = `https://api.darksky.net/forecast/${weather_api_key}/-20.8467,-41.1202?lang=pt&exclude=hourly`
        console.log(api_url)
        try {

            // faz uma requisicao get asincrona utilizando o axios
            const result = await axios.get(api_url)

            // pega os dados retornados, convertendo fahrenheit para celsius
            const temperature = (result.data.currently.temperature - 32) / 1.8
            const summary = result.data.currently.summary
            const min = (result.data.daily.data[0].temperatureLow - 32) / 1.8
            const max = (result.data.daily.data[0].temperatureHigh - 32) / 1.8

            let messages = agent.consoleMessages.map(message => message.text)
            messages.push(`A previsão do clima hoje para cachoeiro é de tempo ${summary}. Com temperatura mínima de ${min.toFixed(2)}°C e máxima de ${max.toFixed(2)}°C.`)
            messages.push(`A temperatura agora é de ${temperature.toFixed(2)}°C.`)
            agent.add(messages)
        } catch (err) {
            console.error(err)
        }
    }

    async function temperatura(agent) {
        const latitude = -20.8467
        const longtitude = -41.1202
        const api_url = `https://api.darksky.net/forecast/${weather_api_key}/${latitude},${longtitude}`
        console.log(api_url)

        try {
            const result = await axios.get(api_url)
            const temperature = (result.data.currently.temperature - 32) / 1.8
            let messages = agent.consoleMessages.map(message => message.text)
            messages.push(`A temperatura agora em cachoeiro é de ${temperature.toFixed(2)} graus celsius.`)
            agent.add(messages)

        } catch (err) {
            console.error(err)
        }

    }


    async function contraFake(agent) {
        const url = `https://www.kachu.com.br/bot/contracheque.php?cpf=${agent.parameters.cpf}&mes=${agent.parameters.mes}&ano=${agent.parameters.ano}&output=json`
        console.log(url)
        console.log(agent.parameters)
        try {
            const result = await axios.get(url)
            console.log(result.data)

            let mensagemFinal = []
            mensagemFinal.push(`CONTRACHEQUE - ${result.data.mes} / ${result.data.ano}`)
            mensagemFinal.push(`Nome: ${result.data.name} - ${result.data.cpf}`)
            mensagemFinal.push(`Salario Bruto: ${result.data.salariobruto}`)
            mensagemFinal.push(`Descontos: ${result.data.descontos}`)
            mensagemFinal.push(`Salário Líquido: ${result.data.salarioliquido}`)
            // mensagemFinal.push()

            let richMessages = []

            const simpleText = new Text({
                text: `CONTRACHEQUE - ${result.data.mes} / ${result.data.ano}`,
                platform: 'FACEBOOK'
            })

            const fbMessage = new Payload('FACEBOOK', {
                attachment: {
                    type: "template",
                    payload: {
                        template_type: "list",
                        elements: [
                            {
                                title: 'Nome',
                                subtitle: result.data.name
                            },
                            {
                                title: 'Salário bruto',
                                subtitle: result.data.salariobruto
                            },
                            {
                                title: 'Descontos',
                                subtitle: result.data.descontos
                            },
                            {
                                title: 'Salário líquido',
                                subtitle: result.data.salarioliquido
                            },
                        ],
                        buttons: [
                            {
                                type: "web_url",
                                url: `https://www.kachu.com.br/bot/contracheque.php?cpf=${agent.parameters.cpf}&mes=${agent.parameters.mes}&ano=${agent.parameters.ano}`,
                                title: "Detalhado"
                            }
                        ]
                    }
                }
            })

            richMessages.push(simpleText, fbMessage)
            agent.add(richMessages)

            // agent.add(mensagemFinal)

            // // {
            // //     
            // //   }
            // agent.add(new Payload('FACEBOOK', {
            //     attachment: {
            //         type: "template",
            //         payload: {
            //             template_type: "button",
            //             text: "Try the URL button!",
            //             buttons: [
            //                 {
            //                     type: "web_url",
            //                     url: "https://www.messenger.com/",
            //                     title: "URL Button",
            //                     webview_height_ratio: "full"
            //                 }
            //             ]
            //         }
            //     }
            // }))

        } catch (err) {
            console.error(err)
        }

    }

    // nome da intent (case sensitive) e da funcao que trata tal intent
    let intentMap = new Map();
    intentMap.set('temperatura', temperatura);
    intentMap.set('clima', clima);
    intentMap.set('Contracheque', contraFake)
    agent.handleRequest(intentMap);
})

app.listen(port, console.log(`Server started listening on ${port}`))


