const NewPromoService = require('../service/new-promo-api-service')

class NewPromoController {

    async getNewPromo(req, res, next) {
        try {
            // получаем промо
            const promo = await NewPromoService.getNewPromo()
            return res.json(promo)
        } catch (e) {
            next(e)
        }
    }

    async createNewPromo(req, res, next) {
        try {
            // получаем промо
            const promo = await NewPromoService.getNewPromo()
            return res.json(promo)
        } catch (e) {
            next(e)
        }
    }

    async deleteNewPromo(req, res, next) {
        try {
            const {id} = req.body
            const promo = await NewPromoService.deleteNewPromo(id)
            return res.json(promo)
        } catch (e) {
            next(e)
        }
    }
}

module.exports = new NewPromoController()