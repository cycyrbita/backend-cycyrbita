require('dotenv').config({path: '../'})
const NewPromoService = require('../service/new-promo-service')

class NewPromoApiController {

    async checkAuthNewPromo(req, res, next) {
        try {
            res.redirect(req.baseUrl)
        } catch (e) {
            next(e)
        }
    }
}

module.exports = new NewPromoApiController()