require('dotenv').config()
const express = require('express')
const app = express()
const morgan = require("morgan")
const cors = require('cors')
const Person = require('./models/person')

app.use(express.static('build'))
app.use(express.json())
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

const convertDbPersonList = (dbPersonList) => {
    let retPersons = dbPersonList.map((dbPerson) => {
        return convertDbPerson(dbPerson)
    })
    return retPersons
}

const convertDbPerson = (dbPerson) => {
    const retPerson = {
        id: dbPerson._id.toString(),
        name: dbPerson.name,
        number: dbPerson.number
    }
    return retPerson
}

app.get('/info', (request, response, next) => {
    Person.find({})
    .then(persons => {
        const personList = convertDbPersonList(persons)
        console.log(personList)
        const personCount = personList.length
        console.log(personCount)
        const personsInfoParagraph = `<p>Phonebook has info for ${personCount} people</p>`
        const date = Date()
        const dateStringParagraph = `<p>${date.toString()}</p>`
        response.send(personsInfoParagraph + dateStringParagraph)
    })
    .catch(error => next(error))
})

app.get('/api/persons', (request, response, next) => {
    Person.find({})
    .then(persons => {
        response.json(persons)
    })
    .catch(error => next(error))
})

app.get('/api/persons/:id', (request, response, next) => {
    Person.findById(request.params.id)
    .then(person => {
        console.log(person)
        if (person) {
            response.json(person)
        } else {
            response.status(404).end()
        }
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndRemove(request.params.id)
    .then(result => {
        response.status(204).end()
    })
    .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
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
    
    Person.find({})
    .then(persons => {
        const personList = convertDbPersonList(persons)
        console.log(personList)

        const personFound = personList.find(person => {
            return person.name === body.name
        })
        console.log(personFound)
    
        if (personFound) {
            return response.status(400).json({ 
                error: "name must be unique"
            })
        }

        const person = new Person({
            name: body.name,
            number: body.number,
        })
    
        person.save()
        .then(savedPerson => {
            response.json(savedPerson)
        })
        .catch(error => next(error))
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
    const { name, number } = request.body

    const person = {
        name: name,
        number: number,
    }

    Person.findByIdAndUpdate(request.params.id, 
        { name, number }, 
        { new: true, runValidators: true, context: 'query' }
    )
    .then(updatedPerson => {
        response.json(updatedPerson)
    })
    .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}
  
// olemattomien osoitteiden käsittely
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
    console.error(error.message)

    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    } else if (error.name === 'ValidationError') {
        return response.status(400).json({ error: error.message })
    }

    next(error)
}

// tämä tulee kaikkien muiden middlewarejen rekisteröinnin jälkeen!
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})