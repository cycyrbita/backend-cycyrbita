const newPromoApi = require('express').Router()
const newPromoApiController = require('../controllers/new-promo-api-controller')
const authMiddleware = require('../middleware/auth-middleware')

newPromoApi.get('/get-new-promo'/*, authMiddleware*/, newPromoApiController.getNewPromo)
newPromoApi.post('/create-new-promo'/*, authMiddleware*/, newPromoApiController.createNewPromo)
newPromoApi.delete('/delete-new-promo'/*, authMiddleware*/, newPromoApiController.deleteNewPromo)

module.exports = newPromoApi