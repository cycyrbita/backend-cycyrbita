const newPromo = require('express').Router()
const newPromoController = require('../controllers/new-promo-controller')
const authMiddleware = require('../middleware/auth-middleware')

newPromo.get('/get-new-promo', authMiddleware, newPromoController.getNewPromo)

module.exports = newPromo