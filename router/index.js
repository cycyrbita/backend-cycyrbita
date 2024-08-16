const routes = require('express').Router()

const user = require('./user')
const ingredients = require('./ingredients')
const roles = require('./roles')

routes.use(user)
routes.use('/ingredients', ingredients)
routes.use(roles)

module.exports = routes