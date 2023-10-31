const routes = require('express').Router()

const user = require('./user')
const ingredients = require('./ingredients')

routes.use(user)
routes.use('/ingredients', ingredients)

module.exports = routes