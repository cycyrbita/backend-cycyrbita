const NewPromoService = require('../service/new-promo-api-service')
const fs = require("fs");
const archiver = require("archiver");
const path = require('path')

class NewPromoController {

  async getNewPromo(req, res, next) {
    try {
      // получаем промо
      const promo = await NewPromoService.getNewPromo()
      return res.json(promo.reverse())
    }
    catch (e) {
      next(e)
    }
  }

  async downloadNewPromo(req, res, next) {
    try {
      const { promo, link } = req.query
      const archive = archiver('zip', { zlib: { level: 9 } })
      const filePath = path.join(process.env.ROOT_PROMO_PATH, promo, link)
      res.attachment(`${link}.zip`)
      archive.on('error', (error) => console.log(error))
      archive.pipe(res)
      archive.directory(filePath, link)
      archive.finalize();
    }
    catch (e) {
      next(e)
    }
  }

  async deleteNewPromo(req, res, next) {
    try {
      const { id } = req.body
      const promo = await NewPromoService.deleteNewPromo(id)
      return res.json(promo)
    }
    catch (e) {
      next(e)
    }
  }
}

module.exports = new NewPromoController()