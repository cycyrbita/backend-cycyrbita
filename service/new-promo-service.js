require('dotenv').config({ path: '../.env' })
const NewPromoModel = require('../models/new-promo-model')

class NewPromoApiService {
  async checkAuthNewPromo() {
    const promo = await NewPromoModel.find()
    return promo
  }

}

module.exports = new NewPromoApiService()