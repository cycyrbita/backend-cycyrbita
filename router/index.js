const routes = require('express').Router()

const user = require('./user')
const ingredients = require('./ingredients')
const new_promoApi = require('./new-promo-api')
const new_promo = require('./new-promo')

routes.use('/api/',user)
routes.use('/api/ingredients', ingredients)
routes.use('/api/new-promo', new_promoApi)
routes.use('/new_promo/*', new_promo)

module.exports = routes