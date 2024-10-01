require('dotenv').config({ path: '../.env' })
const NewPromoService = require('../service/new-promo-service')
const fs = require("fs");
const archiver = require("archiver");
const path = require('path')

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
      await NewPromoService.downloadNewPromo(res, req)
    }
    catch (e) {
      next(e)
    }

  }

  async uploadArchive(req, res, next) {
    try {
      await NewPromoService.uploadArchive(req)
      return res.status(200).json('архив загружен')
    }
    catch (e) {
      console.log('ошибка в NewPromoService.uploadArchive, а именно:', e)
      res.status(400).json(e)
    }
  }

  async updateNewPromo(req, res, next) {
    try {
      await NewPromoService.updateNewPromo(req)
      res.status(200).json('промо добавлено, создаем скриншот')
    }
    catch (e) {
      next(e)
    }
  }

  async createScreenShot(req, res, next) {
    try {
      await NewPromoService.getScreenShot(req)
      res.status(200).json('скриншот создан')
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