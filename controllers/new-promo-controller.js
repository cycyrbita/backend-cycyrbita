const NewPromoService = require('../service/new-promo-service')

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
}

module.exports = new NewPromoController()