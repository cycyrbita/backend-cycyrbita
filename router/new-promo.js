const newPromo = require('express').Router()
const newPromoController = require('../controllers/new-promo-controller')
const authMiddleware = require('../middleware/auth-middleware')

newPromo.get('/', authMiddleware, newPromoController.checkAuthNewPromo)

module.exports = newPromo