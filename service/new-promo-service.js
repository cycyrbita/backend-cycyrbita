require('dotenv').config({ path: '../.env' })
const NewPromoModel = require('../models/new-promo-model')
const NewPromoTitleModel = require('../models/new-promo-title-model')
const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");
const userService = require("./user-service");
const validContent = ['_prelend', '_lend', '_site']
const getPropertyFromReq = (value) => {
  const arr = validContent.filter(item => value.includes(item))
  return arr[0].replace('_', '') + 's'
}

class NewPromoService {
  async getNewPromo() {
    const promo = await NewPromoModel.find()
    const promoTitle = await NewPromoTitleModel.find()
    return { promo, promoTitle }
  }

  async createOrUpdateNewPromo(req) {
    const isNewPromo = req.body.isNewPromo === 'true'
    const updateProperty = getPropertyFromReq(req.files.archive.name)
    const updateValue = req.files.archive.name.replace('.zip', '')
    const newPromoObject = { title: req.body.title }
    const targetPromo = await NewPromoModel.find({ title: req.body.title })
    const result = isNewPromo ? newPromoObject : targetPromo[0]
    if (isNewPromo) {
      result[updateProperty] = [updateValue]
    }
    else {
      result[updateProperty].push(updateValue)
    }

    await NewPromoModel.findOneAndUpdate({ title: req.body.title }, result, { upsert: true, new: true })
    await NewPromoTitleModel.findOneAndUpdate({ title: req.body.title }, { title: req.body.title }, {
      upsert: true,
      new: true
    })
  }

  async getScreenShot(req, pathToPromo) {
    try {
      const pageSize = { width: 1441, height: 1080 }
      const url = `${process.env.API_URL}new_promo/${req.body.title}/${req.files.archive.name.replace('.zip', '')}/`
      const pathToScreenshot = path.join(pathToPromo, `${req.files.archive.name.replace('.zip', '')}`, 'screenshot.jpg')
      const browser = await puppeteer.launch({
        headless: true,
        ignoreHTTPSErrors: true,
        args: [`--window-size=${pageSize.width},${pageSize.height}`],
        defaultViewport: {
          width: pageSize.width,
          height: pageSize.height
        }
      })
      const page = await browser.newPage()
      const userData = await userService.login(process.env.SMTP_USER, process.env.SMTP_USER)
      await page.setCookie({
        name: 'refreshToken',
        value: userData.refreshToken,
        domain: process.env.DOMAIN
      }, {
        name: 'accessToken',
        value: `Bearer ${userData.accessToken}`,
        domain: process.env.DOMAIN
      })
      await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3738.0 Safari/537.36')
      //TODO что то сделать с goto, потому что иногда ответ приходится ждать больше 2х мин
      await page.goto(url, { timeout: 0, waitUntil: "domcontentloaded" })
      await page.screenshot({ path: pathToScreenshot })
      await browser.close()
    }
    catch (e) {
      console.log(e)
    }
  }

  async deleteNewPromo(req) {
    const { id, title, link } = req.body
    const updateProperty = getPropertyFromReq(link)
    const update = { $pull: {} }

    update.$pull[updateProperty] = link

    fs.rmSync(path.join(process.env.ROOT_PROMO_PATH, title, link), { recursive: true })
    await NewPromoModel.updateOne({ _id: id }, update)
    const promoDir = fs.readdirSync(path.join(process.env.ROOT_PROMO_PATH, title))
    if (promoDir.length === 0) {
      await NewPromoModel.deleteOne({ title: title })
      await NewPromoTitleModel.deleteOne({ title: title })
      fs.rmSync(path.join(process.env.ROOT_PROMO_PATH, title), { recursive: true })
    }
    console.log('promoDir', promoDir)
  }
}

module.exports = new NewPromoService()