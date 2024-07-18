const new_promo = require('express').Router()
const newPromoController = require('../controllers/new-promo-controller')
const authMiddleware = require('../middleware/auth-middleware')

new_promo.get('/get-new-promo', authMiddleware, newPromoController.getNewPromo)

module.exports = new_promo