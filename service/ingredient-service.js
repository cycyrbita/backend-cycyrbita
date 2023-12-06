const sharp = require('sharp')
let fs = require('fs')
const IngredientModel = require('../models/ingerdient-model')

class IngredientService {
    async create(ingredientsImages, ingredient) {
        // список файлов которые не прошли проверку
        let errorMimetype = []
        ingredient.images = []

        // проверка на файлы
        if(!!ingredientsImages) {
            // указываем типы которые хотим принимать
            const MIMETYPE = ['image/jpeg', 'image/jpg', 'image/svg+xml', 'image/png', 'image/webp']

            // проверяем есть ли папка
            if (!fs.existsSync(`${process.env.IMG_PATH}/ingredients`)) {
                // если папки нет то создаем
                fs.mkdirSync(`${process.env.IMG_PATH}/ingredients`, { recursive: true })
            }

            // перебираем все файлы и запускаем sharp
            for(const el of ingredientsImages) {
                // пушим файл который не прошел проверку
                if(!MIMETYPE.includes(el.mimetype)) {
                    errorMimetype.push(el.name)
                    continue
                }

                // забираем формат
                let format = el.mimetype.split('/')
                if(format[1] === 'svg+xml') format[1] = 'svg'

                // рандомное имя
                let fileName = `ingredients-${Math.floor(Math.random() * 100)}-${Date.now()}.${format[1]}`

                // загружаем файл
                await sharp(el.data)
                    .toBuffer((err) => {if(err) console.log(err)})
                    .png({ quality: 80 })
                    .toFile(`${process.env.IMG_PATH}/ingredients/${fileName}`, (err) => {
                        if(err) console.log(err)
                    })

                // создаем картинку в базе и пушим в переменную imagesDb
                ingredient.images.push({src: fileName, alt: 'Картинка'})
            }
        }

        return IngredientModel.create(ingredient)
    }

    async getIngredients() {
        return IngredientModel.find()
    }

    async getIngredient(id) {
        return IngredientModel.findOne({ _id: id })
    }

    async deletedIngredient(id, images) {
        // пробегаемся по файлам и удаляем
        if(images.length) {
            for(const img of images) {
                fs.unlink(`${process.env.IMG_PATH}/ingredients/${img.src}`, err => {
                    if(err) return
                })
            }
        }

         // удаляем из базы
        return IngredientModel.deleteOne({ _id: id })
    }

    async editIngredient(ingredientsImages, ingredient) {
        // список файлов которые не прошли проверку
        let errorMimetype = []
        ingredient.images = []

        const oldIngredient = await IngredientModel.findOne({ _id: ingredient._id })

        // проверка на файлы
        if(!!ingredientsImages) {
            // указываем типы которые хотим принимать
            const MIMETYPE = ['image/jpeg', 'image/jpg', 'image/svg+xml', 'image/png', 'image/webp']

            // проверяем есть ли папка
            if (!fs.existsSync(`${process.env.IMG_PATH}/ingredients`)) {
                // если папки нет то создаем
                fs.mkdirSync(`${process.env.IMG_PATH}/ingredients`, { recursive: true })
            }

            // перебираем все файлы и запускаем sharp
            for(const el of ingredientsImages) {
                // пушим файл который не прошел проверку
                if(!MIMETYPE.includes(el.mimetype)) {
                    errorMimetype.push(el.name)
                    continue
                }

                // забираем формат
                let format = el.mimetype.split('/')
                if(format[1] === 'svg+xml') format[1] = 'svg'

                // рандомное имя
                let fileName = `ingredients-${Math.floor(Math.random() * 100)}-${Date.now()}.${format[1]}`

                // загружаем файл
                await sharp(el.data)
                    .toBuffer((err) => {if(err) console.log(err)})
                    .toFile(`${process.env.IMG_PATH}/ingredients/${fileName}`, (err) => {if(err) console.log(err)})

                // создаем картинку в базе и пушим
                ingredient.images.push({src: fileName, alt: 'Картинка'})

                // удаляем лишние картинки
                oldIngredient.images.some(old => {
                    if(old.src !== fileName) {
                        fs.unlink(`${process.env.IMG_PATH}/ingredients/${old.src}`, err => {
                            if(err) return
                        })
                    }
                })
            }
        }
        return IngredientModel.replaceOne({ _id: ingredient._id }, ingredient)
    }
}

module.exports = new IngredientService()