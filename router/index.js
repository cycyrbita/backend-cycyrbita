const routes = require('express').Router()

const user = require('./user')
const ingredients = require('./ingredients')
const roles = require('./roles')
const new_promo = require('./new-promo')

routes.use(user)
routes.use('/ingredients', ingredients)
routes.use(roles)
routes.use('/new-promo', new_promo)

module.exports = routes
