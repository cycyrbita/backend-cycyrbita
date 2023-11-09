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

        // данные после загрузки в базу
        const countrysDb = []
        const themesDb = []
        const titlesDb = []
        const descriptionsDb = []
        const tagsDb = []
        const imagesDb = []

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

                imagesDb.push(await IngredientImageModel.create({src: fileName, alt: 'Картинка'}))

                // пушим картинку в массив картинок
                images.push(fileName)
            }
        }

        // создание с языков
        if(countrys.length) {
            for(const country of countrys) {
                countrysDb.push(await IngredientCountryModel.create(country))
            }
        }

        // создание тем
        if(themes.length) {
            for(const theme of themes) {
                themesDb.push(await IngredientThemeModel.create(theme))
            }
        }

        // создание описаний
        if(descriptions.length) {
            for(const description of descriptions) {
                let themes = themesDb.filter(el => description.themes.includes(el.theme))
                if(themes.length) {
                    descriptionsDb.push(await IngredientDescriptionModel.create({description: description.description, country: description.country, themes}))
                }
            }
        }

        // создание тегов
        if(tags.length) {
            for(const tag of tags) {
                let themes = themesDb.filter(el => tag.themes.includes(el.theme))
                if(themes.length) {
                    tagsDb.push(await IngredientTagModel.create({tag: tag.tag, themes}))
                }
            }
        }

        // создание названий
        if(titles.length) {
            for(const title of titles) {
                const country = countrysDb.filter(el => title.country === el.country)
                if(country.length) {
                    titlesDb.push(await IngredientTitleModel.create({title: title.title, country: title.country}))
                }
            }
        }

        await IngredientModel.create({
            countrys: countrysDb,
            themes: themesDb,
            titles: titlesDb,
            descriptions: descriptionsDb,
            tags: tagsDb,
            images: imagesDb
        })

        return 'Ингредиент создан!'
    }
}

module.exports = new IngredientService()