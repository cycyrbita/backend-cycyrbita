require('dotenv').config({ path: '../.env' })
const NewPromoModel = require('../models/new-promo-model')
const fs = require("fs");

class NewPromoService {
  async getNewPromo() {
    const promo = await NewPromoModel.find()
    return promo
  }

  async createNewPromo() {
    const promo = await NewPromoModel.find()
    return promo
  }

  async deleteNewPromo(id, path) {
    fs.unlink(`${process.env.NEW_PROMO_PATH}/${path}`, err => {
      if (err) return
    })

    return NewPromoModel.deleteOne({ _id: id })
  }
}

module.exports = new NewPromoService()