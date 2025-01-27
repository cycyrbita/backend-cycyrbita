require('dotenv').config({ path: '../.env' })
const NewPromoModel = require('../models/new-promo-model')
const NewPromoTitleModel = require('../models/new-promo-title-model')
const userService = require("./user-service");
const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");
const adm = require('adm-zip')
const archiver = require('archiver')
const mv = require('mv')
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

    async downloadNewPromo(res, req) {
      try {
        const { promo, link } = req.query
        const archive = archiver('zip', { zlib: { level: 9 } })
        const filePath = path.join(process.env.PROMO_PATH, promo, link)
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

  async updateNewPromo(req) {
    const isNewPromo = req.body.isNewPromo === 'true'
    const updatedProperty = getPropertyFromReq(req.body.archiveName)
    const newPromoObject = { title: req.body.title }
    const targetPromo = await NewPromoModel.find({ title: req.body.title })
    const result = isNewPromo ? newPromoObject : targetPromo[0]
    if (isNewPromo) {
      result[updatedProperty] = [req.body.archiveName]
    }
    else {
      result[updatedProperty].push(req.body.archiveName)
    }

    await NewPromoModel.findOneAndUpdate({ title: req.body.title }, result, { upsert: true, new: true })
    await NewPromoTitleModel.findOneAndUpdate({ title: req.body.title }, { title: req.body.title }, {
      upsert: true,
      new: true
    })
  }

  async uploadArchive(req) {
    try {
      const isNewPromo = req.body.isNewPromo === 'true'
      const archive = req.files.archive;
      const targetPath = path.join(process.env.PROMO_PATH, req.body.title)
      const bufferPath = path.join(process.env.ROOT_BUFFER_DIRECTORY)
      const zipPath = path.join(bufferPath, archive.name)
      const extractPath = path.join(bufferPath, 'extracted')
      let listBufferDirectory
      let infoAboutFIle
      let zip

      //unzip archive to buffer directory
      await fs.rmSync(bufferPath, { recursive: true, force: true })
      fs.mkdirSync(bufferPath)
      await archive.mv(path.join(zipPath))
      zip = new adm(zipPath, {})
      zip.extractAllTo(extractPath)
      await fs.rmSync(zipPath)

      //check structure
      listBufferDirectory = fs.readdirSync(extractPath)
      infoAboutFIle = listBufferDirectory.length !== 0 ? fs.statSync(path.join(extractPath, listBufferDirectory[0])) : null

      //return status 400 bsc structure is invalid
      if (listBufferDirectory.length === 0) {
        return new Error('архив пустой')
      }


      if (listBufferDirectory.length === 1 && !infoAboutFIle.isDirectory()) {
        return new Error('в архиве всего один файл, ты угораешь?')
      }

      if (listBufferDirectory.length === 1 && !fs.readdirSync(path.join(extractPath, listBufferDirectory[0])).includes('index.html')) {
        return new Error('неправильная структура архива, а именно нету index.html в папке с промо')
      }

      if (listBufferDirectory.length !== 1 && !listBufferDirectory.includes('index.html')) {
        return new Error('неправильная структура архива, а именно нету index.html в архиве')
      }

      //rename promo directory as archiveName
      if (listBufferDirectory.length === 1 && req.body.archiveName !== listBufferDirectory[0]) {
        fs.renameSync(path.join(extractPath, listBufferDirectory[0]), path.join(path.join(extractPath, req.body.archiveName)))
      }

      //build correct structure
      if (listBufferDirectory.includes('index.html')) {
        fs.mkdirSync(path.join(extractPath, req.body.archiveName))
        const array = listBufferDirectory.filter(item => item !== req.body.archiveName)
        for (const item of array) {
          fs.renameSync(path.join(extractPath, item), path.join(path.join(extractPath, req.body.archiveName, item)))
        }
      }

      //create directory for promo
      if (isNewPromo && fs.existsSync(targetPath)) {
        return new Error('ты создал новое промо, но такое промо уже есть. Кажется ты что то неправильно делаешь. Ну или никита опять все сломал')
      }
      if (isNewPromo) {
        fs.mkdirSync(targetPath)
      }

      //move promo from buffer to target directory
      if (fs.existsSync(path.join(targetPath, req.body.archiveName))) {
        return new Error('промо с таким названием уже есть, кажется ты что то перепутал')
      }
      mv(path.join(path.join(extractPath, req.body.archiveName)), path.join(targetPath, req.body.archiveName), (err) => {
        return err ? new Error('ошибка при переносе директории') : undefined
      })
    }
    catch (error) {
      console.log(error)
      throw new error(error)
    }

  }

  async getScreenShot(req) {
    try {
      const targetPath = path.join(process.env.PROMO_PATH, req.body.title)
      const pageSize = { width: 1441, height: 1080 }
      const url = `${process.env.API_URL}new_promo/${req.body.title}/${req.body.archiveName}/`
      const pathToScreenshot = path.join(targetPath, `${req.body.archiveName}`, 'screenshot.jpg')
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
      const userData = await userService.login(process.env.SCREENSHOT_ACCOUNT, process.env.SCREENSHOT_ACCOUNT)
      await page.setCookie({
        name: 'refreshToken',
        value: userData.refreshToken,
        domain: process.env.DOMAIN
      }, {
        name: 'accessToken',
        value: userData.accessToken,
        domain: process.env.DOMAIN
      })
      await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3738.0 Safari/537.36')
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

    fs.rmSync(path.join(process.env.PROMO_PATH, title, link), { recursive: true })
    await NewPromoModel.updateOne({ _id: id }, update)
    const promoDir = fs.readdirSync(path.join(process.env.PROMO_PATH, title))
    if (promoDir.length === 0) {
      await NewPromoModel.deleteOne({ title: title })
      await NewPromoTitleModel.deleteOne({ title: title })
      fs.rmSync(path.join(process.env.PROMO_PATH, title), { recursive: true })
    }
  }
}

module.exports = new NewPromoService()