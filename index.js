require('dotenv').config()
const express = require('express')
const app = express()
const morgan = require("morgan")
const cors = require('cors')
const Person = require('./models/person')

app.use(express.json())
app.use(express.static('build'))
app.use(cors())

morgan.token("myToken", (request, response) => { 
    if (request.body) {
        return JSON.stringify(request.body)
    }
})
app.use(morgan(":method :url :status :res[content-length] - :response-time ms :myToken"))

const getRandomInt = (min, max) => {
    min = Math.ceil(min)
    max = Math.floor(max)
    return Math.floor(Math.random() * (max - min) + min)
}

let phonebook = [
    {
        id: 1,
        name: "Arto Hellas",
        number: "040-123456"
    },
    {
        id: 2,
        name: "Ada Lovelace",
        number: "39-44-5323523"
    },
    {
        id: 3,
        name: "Dan Abramov",
        number: "12-43-234345"
    },
    {
        id: 4,
        name: "Mary Poppendick",
        number: "39-23-6423122"
    }
  ]

app.get('/info', (request, response) => {
    const personCount = phonebook.length
    const phonebookInfoParagraph = `<p>Phonebook has info for ${personCount} people</p>`
    const date = Date()
    const dateStringParagraph = `<p>${date.toString()}</p>`
    response.send(phonebookInfoParagraph + dateStringParagraph)
})

app.get('/api/persons', (request, response) => {
    Person.find({}).then(persons => {
        response.json(persons)
    })
})

app.get('/api/persons/:id', (request, response) => {
    Person.findById(request.params.id).then(person => {
        response.json(person)
    })
    // console.log(person)
    // if (person) {
    //     response.json(person)
    // } else {
    //     response.status(404).end()
    // }
})

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    phonebook = phonebook.filter(person => {
        return person.id !== id
    })
    response.status(204).end()
})

app.post('/api/persons', (request, response) => {
    const body = request.body

    if (!body.name) {
        return response.status(400).json({ 
            error: "name is missing"
        })
    }
    if (!body.number) {
        return response.status(400).json({ 
            error: "number is missing"
        })
    }

    // const personFound = phonebook.find(person => {
    //     return person.name === body.name
    // })

    // if (personFound) {
    //     return response.status(400).json({ 
    //         error: "name must be unique"
    //     })
    // }

    const person = new Person({
        name: body.name,
        number: body.number,
    })

    person.save().then(savedPerson => {
        response.json(savedPerson)
    })
})

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})