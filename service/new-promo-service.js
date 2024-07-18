const NewPromoModel = require('../models/new-promo-model')

class NewPromoService {
    async getNewPromo() {
        const promo = await NewPromoModel.find()
        return promo
    }
}