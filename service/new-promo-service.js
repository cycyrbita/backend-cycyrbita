require('dotenv').config({ path: '../.env' })
const mv = require('mv')
const NewPromoModel = require('../models/new-promo-model')
const NewPromoTitleModel = require('../models/new-promo-title-model')
const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");
const userService = require("./user-service");
const unzipper = require("unzipper");
const archiver = require("archiver");
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
    const isNewPromo = req.body.isNewPromo === 'true'
    const bufferStream = require('stream').Readable.from(req.files.archive.data);
    const targetPath = path.join(process.env.ROOT_PROMO_PATH, req.body.title)
    const bufferPath = path.join(process.env.ROOT_BUFFER_DIRECTORY)

    //clear and create buffer directory
    await fs.rmSync(bufferPath, { recursive: true, force: true })
    fs.mkdirSync(bufferPath)

    //unzip archive to buffer directory
    try {
      return await new Promise((resolve, reject) => {
        bufferStream.pipe(unzipper.Extract({ path: bufferPath }))
          .on('error', (err) => {
            return reject('Ошибка при разархивировании:', err);
          })
          .on('close', () => {
            //check structure
            const listBufferDirectory = fs.readdirSync(bufferPath)
            const infoAboutFIle = listBufferDirectory.length !== 0 ? fs.statSync(path.join(bufferPath, listBufferDirectory[0])) : null

            //return status 400 bsc structure is invalid
            if (listBufferDirectory.length === 0) {
              return reject('архив пустой')
            }


            if (listBufferDirectory.length === 1 && !infoAboutFIle.isDirectory()) {
              return reject('в архиве всего один файл, ты угораешь?')
            }

            if (listBufferDirectory.length === 1 && !fs.readdirSync(path.join(bufferPath, listBufferDirectory[0])).includes('index.html')) {
              return reject('неправильная структура архива, а именно нету index.html в папке с промо')
            }

            if (listBufferDirectory.length !== 1 && !listBufferDirectory.includes('index.html')) {
              return reject('неправильная структура архива, а именно нету index.html в архиве')
            }

            //rename promo directory as archiveName
            if (listBufferDirectory.length === 1 && req.body.archiveName !== listBufferDirectory[0]) {
              fs.renameSync(path.join(bufferPath, listBufferDirectory[0]), path.join(path.join(bufferPath, req.body.archiveName)))
            }

            //build correct structure
            if (listBufferDirectory.includes('index.html')) {
              fs.mkdirSync(path.join(bufferPath, req.body.archiveName))
              const array = listBufferDirectory.filter(item => item !== req.body.archiveName)
              for (const item of array) {
                fs.renameSync(path.join(bufferPath, item), path.join(path.join(bufferPath, req.body.archiveName, item)))
              }
            }

            //create directory for promo
            if (isNewPromo && fs.existsSync(targetPath)) {
              return reject('ты создал новое промо, но такое промо уже есть. Кажется ты что то неправильно делаешь. Ну или никита опять все сломал')
            }
            if (isNewPromo) {
              fs.mkdirSync(targetPath)
            }


            //move promo from buffer to target directory
            if (fs.existsSync(path.join(targetPath, req.body.archiveName))) {
              return reject('промо с таким названием уже есть, кажется ты что то перепутал')
            }
            mv(path.join(path.join(bufferPath, req.body.archiveName)), path.join(targetPath, req.body.archiveName), (err) => {
              return err ? reject('ошибка при переносе директории') : resolve()
            })

          })
      })
    }
    catch (e) {
      throw (e)
    }
  }

  async getScreenShot(req) {
    try {
      const targetPath = path.join(process.env.ROOT_PROMO_PATH, req.body.title)
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
      const userData = await userService.login(process.env.SMTP_USER, process.env.SMTP_USER)
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
  }
}

module.exports = new NewPromoService()