const sharp = require('sharp')
let fs = require('fs')
const IngredientModel = require('../models/ingerdient-model')
const IngredientThemeModel = require('../models/ingerdient-theme-model')

class IngredientService {
    async getIngredientThemes() {
        return IngredientThemeModel.find()
    }

    async createIngredientTheme(theme) {
        return IngredientThemeModel.create(theme)
    }

    async createIngredient(ingredientsImages, ingredient) {
        // список файлов которые не прошли проверку
        let errorMimetype = []
        ingredient.images = []

        // проверка на файлы
        if(!!ingredientsImages) {
            // указываем типы которые хотим принимать
            const MIMETYPE = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

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

                // рандомное имя
                let fileName = `ingredients-${Math.floor(Math.random() * 100)}-${Date.now()}.${format[1]}`

                // // загружаем файл
                await sharp(el.data)
                    .resize({ width: 800, withoutEnlargement: true })
                    .toFormat(format[1], { quality: 60 })
                    .toFile(`${process.env.IMG_PATH}/ingredients/${fileName}`)
                    .then(r => console.log('Загрузка завершена!'))
                    .catch(e => console.log('Ошибка при загрузке'))

                // создаем картинку в базе и пушим в переменную imagesDb
                ingredient.images.push(fileName)
            }
        }

        return IngredientModel.create(ingredient)
    }

    async getIngredients(paginationCount, limit, filterIngredients) {
        const ingredientsLength = await IngredientModel.find({
            // 'themes.theme': {$in: filterIngredients.themes.map(el => el.theme)},
            'themes.description': {$regex: filterIngredients.name, $options: 'i'},
            'names.name': {$regex: filterIngredients.name, $options: 'i'},
        }).count()

        const ingredients = await IngredientModel.find({
            // 'themes.theme': {$in: filterIngredients.themes.map(el => el.theme)},
            'themes.description': {$regex: filterIngredients.name, $options: 'i'},
            'names.name': {$regex: filterIngredients.name, $options: 'i'},
        }).skip(paginationCount).sort({_id: -1}).limit(limit)

        return {ingredients, ingredientsLength}
    }

    async getIngredient(id) {
        return IngredientModel.findOne({ _id: id })
    }

    async deletedIngredient(id, images) {
        // пробегаемся по файлам и удаляем
        if(images.length) {
            for(const img of images) {
                fs.unlink(`${process.env.IMG_PATH}/ingredients/${img}`, err => {
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
            const MIMETYPE = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

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

                // рандомное имя
                let fileName = `ingredients-${Math.floor(Math.random() * 100)}-${Date.now()}.${format[1]}`

                // загружаем файл
                await sharp(el.data)
                    .resize({ width: 800, withoutEnlargement: true })
                    .toFormat(format[1], { quality: 60 })
                    .toFile(`${process.env.IMG_PATH}/ingredients/${fileName}`)
                    .then(r => console.log('Загрузка завершена!'))
                    .catch(e => console.log('Ошибка при загрузке'))

                // создаем картинку в базе и пушим
                ingredient.images.push(fileName)

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