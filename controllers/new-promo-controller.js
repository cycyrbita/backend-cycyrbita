require('dotenv').config({ path: '../.env' })
const NewPromoService = require('../service/new-promo-service')
const fs = require("fs");
const archiver = require("archiver");
const path = require('path')
const unzipper = require('unzipper')
const newPromoDb = require('../models/new-promo-model')
const dbTitle = require("../models/new-promo-title-model");

class NewPromoController {

  async getNewPromo(req, res, next) {
    try {
      // получаем промо
      const bd = await NewPromoService.getNewPromo()
      const promo = bd.promo.reverse()
      const promoTitle = bd.promoTitle.reverse()
      return res.json({ promo, promoTitle })
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

  async uploadNewPromo(req, res, next) {
    try {
      const bufferStream = require('stream').Readable.from(req.files.archive.data);
      const targetPath = path.join(process.env.ROOT_PROMO_PATH, req.body.title)
      if (!fs.existsSync(targetPath)) {
        fs.mkdirSync(targetPath)
      }
      bufferStream.pipe(unzipper.Extract({ path: targetPath }))
        .on('error', (err) => {
          console.error('Ошибка при разархивировании:', err);
          res.status(500).send('Произошла ошибка при разархивировании файла.');
        })
        .on('close', async () => {
          await NewPromoService.createOrUpdateNewPromo(req)
          await NewPromoService.getScreenShot(req, targetPath)
          res.status(200).send('Файл разархивирован')
        });
    }
    catch (e) {
      next(e)
    }
  }

  async deleteNewPromo(req, res, next) {
    try {
      await NewPromoService.deleteNewPromo(req)
      res.sendStatus(200)
    }
    catch (e) {
      next(e)
    }
  }
}

module.exports = new NewPromoController()