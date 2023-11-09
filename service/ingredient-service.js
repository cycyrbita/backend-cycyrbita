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

        // упрощаем обращение к данным
        const countrys = ingredients.countrys
        const themes = ingredients.themes
        const titles = ingredients.titles
        const descriptions = ingredients.descriptions
        const tags = ingredients.tags

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

                // создаем картинку в базе и пушим в переменную imagesDb
                imagesDb.push(await IngredientImageModel.create({src: fileName, alt: 'Картинка'}))
            }
        }

        // проверка есть ли языки
        if(countrys.length) {
            // пробегаемся по языкам
            for(const country of countrys) {
                // проверка на пустоту и создание языка
                if(country.country.trim() !== "") countrysDb.push(await IngredientCountryModel.create(country))
            }
        }

        // проверка есть ли темы
        if(themes.length) {
            // пробегаемся по темам
            for(const theme of themes) {
                // проверка на пустоту и создание тем
                if(theme.theme.trim() !== "")themesDb.push(await IngredientThemeModel.create(theme))
            }
        }

        // проверка есть ли описания
        if(descriptions.length) {
            // пробегаемся по описаниям
            for(const description of descriptions) {
                // проверяем есть ли совпадения между темами ингредиента и темами описания и если есть создаем массив из них
                let themes = themesDb.filter(el => description.themes.includes(el.theme))
                // проверка на пустоту
                if(themes.length) {
                    // создаем описание в базе и пушим в переменную descriptionsDb
                    descriptionsDb.push(await IngredientDescriptionModel.create({description: description.description, country: description.country, themes}))
                }
            }
        }

        // проверка есть ли теги
        if(tags.length) {
            // пробегаемся по тегам
            for(const tag of tags) {
                // проверяем есть ли совпадения между темами ингредиента и темами тега и если есть создаем массив из них
                let themes = themesDb.filter(el => tag.themes.includes(el.theme))
                // проверка на пустоту
                if(themes.length) {
                    // создаем тег в базе и пушим в переменную tagsDb
                    tagsDb.push(await IngredientTagModel.create({tag: tag.tag, themes}))
                }
            }
        }

        // проверка есть ли названия
        if(titles.length) {
            // пробегаемся по названиям
            for(const title of titles) {
                // проверяем есть ли совпадения между языками ингредиента и языками названий и если есть создаем массив из них
                const country = countrysDb.filter(el => title.country === el.country)
                // проверка на пустоту
                if(country.length) {
                    // создаем название в базе и пушим в переменную titlesDb
                    titlesDb.push(await IngredientTitleModel.create({title: title.title, country: title.country}))
                }
            }
        }

        // создаем ингредиент
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