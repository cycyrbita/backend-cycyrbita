const sharp = require('sharp')
let fs = require('fs')
const PATH_INGREDIENTS = 'assets/ingredients'
const IngredientModel = require('../models/ingredients/ingerdient-model')
const IngredientDescriptionModel = require('../models/ingredients/ingerdient_description-model')
const IngredientImageModel = require('../models/ingredients/ingerdient_image-model')
const IngredientCountryModel = require('../models/ingredients/ingerdient_country-model')
const IngredientTagModel = require('../models/ingredients/ingerdient_tag-model')
const IngredientThemeModel = require('../models/ingredients/ingerdient_theme-model')
const IngredientTitleModel = require('../models/ingredients/ingerdient_title-model')

class IngredientService {
    async create(ingredientsImages, ingredients) {
        // список файлов которые не прошли проверку
        let errorMimetype = []
        const countrys = ingredients.countrys
        const themes = ingredients.themes
        const titles = ingredients.titles
        const descriptions = ingredients.descriptions
        const tags = ingredients.tags
        const images = []

        // проверка на файлы
        if(!!ingredientsImages) {
            // указываем типы которые хотим принимать
            const MIMETYPE = ['image/jpeg', 'image/jpg', 'image/svg+xml', 'image/png', 'image/webp']

            // проверяем есть ли папка
            if (!fs.existsSync(PATH_INGREDIENTS)) {
                // если папки нет то создаем
                fs.mkdirSync(PATH_INGREDIENTS, { recursive: true })
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

                await IngredientImageModel.create({src: fileName})

                // пушим картинку в массив картинок
                images.push(fileName)
            }
        }

        console.log(countrys)

        if(countrys.length) {
            for(const country of countrys) {
                let asd = await IngredientCountryModel.create(country)
                console.log(asd)
            }
        }

        return 'Ингредиент создан!'
    }
}

module.exports = new IngredientService()