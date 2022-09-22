const express = require('express')
const app = express()

app.use(express.json())

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

app.get('/info', (req, res) => {
    const personCount = phonebook.length
    const phonebookInfoParagraph = `<p>Phonebook has info for ${personCount} people</p>`
    const date = Date()
    const dateStringParagraph = `<p>${date.toString()}</p>`
    res.send(phonebookInfoParagraph + dateStringParagraph)
})

app.get('/api/persons', (req, res) => {
    res.json(phonebook)
})

app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = phonebook.find(person => {
        return person.id === id
    })
    console.log(person)
    if (person) {
        response.json(person)
    } else {
        response.status(404).end()
    }
})

const PORT = 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})