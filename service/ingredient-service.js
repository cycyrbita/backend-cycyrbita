const sharp = require('sharp')
let fs = require('fs')
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
        const countries = ingredients.countries
        const themes = ingredients.themes
        const titles = ingredients.titles
        const descriptions = ingredients.descriptions
        const tags = ingredients.tags

        // данные после загрузки в базу
        const countriesDb = []
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

                // создаем картинку в базе и пушим в переменную imagesDb
                imagesDb.push(await IngredientImageModel.create({src: fileName, alt: 'Картинка'}))
            }
        }

        // проверка есть ли языки
        if(countries.length) {
            // пробегаемся по языкам
            for(const country of countries) {
                if(country.country.trim() === '') continue
                // поиск похожего языка
                const repeatСountry = await IngredientCountryModel.find(country)
                // загружаем если языка нет
                if(!repeatСountry.length) {
                    countriesDb.push(await IngredientCountryModel.create(country))
                    continue
                }
                // пушим
                countriesDb.push(repeatСountry[0])
            }
        }

        // проверка есть ли темы
        if(themes.length) {
            // пробегаемся по темам
            for(const theme of themes) {
                // проверка на пустоту
                if(theme.theme.trim() === '') continue
                // поиск похожей темы
                const repeatTheme = await IngredientThemeModel.find(theme)
                // загружаем если темы нету
                if(!repeatTheme.length) {
                    themesDb.push(await IngredientThemeModel.create(theme))
                    continue
                }
                // пушим
                themesDb.push(repeatTheme[0])
            }
        }

        // проверка есть ли описания
        if(descriptions.length) {
            // пробегаемся по описаниям
            for(const description of descriptions) {
                // проверяем есть ли совпадения между темами ингредиента и темами описания и если есть создаем массив из них
                let themes = themesDb.filter(el => description.themes.find(item => item.theme.toLowerCase() === el.theme.toLowerCase()))
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
                // это нужно чтобы тег всегда имел тему
                let themes = themesDb.filter(el => tag.themes.find(item => item.theme.toLowerCase() === el.theme.toLowerCase()))
                // проверка на пустоту
                if(themes.length) {
                    // проверка на пустоту
                    if(tag.tag.trim() === '') continue
                    // поиск похожего тега
                    const repeatTag = await IngredientTagModel.find({tag: tag.tag})
                    // если пусто создаем
                    if(!repeatTag.length) {
                        tagsDb.push(await IngredientTagModel.create({tag: tag.tag, themes}))
                        continue
                    }

                    // если в теге нет темы то мы ее добавляем
                    for(const el1 of tag.themes) {
                        let flag = false
                        for(const el2 of repeatTag[0].themes) {
                            if(el1.theme === el2.theme) flag = true
                        }
                        if(!flag) await IngredientTagModel.updateOne({tag: tag.tag}, {$push: {themes: themesDb.find(el => el.theme === el1.theme)}})
                    }

                    tagsDb.push(repeatTag[0])
                }
            }
        }

        // проверка есть ли названия
        if(titles.length) {
            // пробегаемся по названиям
            for(const title of titles) {
                // проверяем есть ли совпадения между языками ингредиента и языками названий и если есть создаем массив из них
                // это нужно что бы у названия всегда был язык
                const country = countriesDb.filter(el => title.country.toLowerCase() === el.country.toLowerCase())
                // проверка на пустоту
                if(country.length) {
                    // проверка на пустоту
                    if(title.title.trim() === '' || title.country.trim() === '') continue
                    // поиск похожей темы
                    const repeatTitle = await IngredientTitleModel.find(title)
                    // проверка на пустоту и создание
                    if(!repeatTitle.length) {
                        titlesDb.push(await IngredientTitleModel.create(title))
                        continue
                    }
                    // пушим
                    titlesDb.push(repeatTitle[0])
                }
            }
        }

        let ingredient = null
        // создаем ингредиент
        if(titles.length) {
            ingredient = await IngredientModel.create({
                countries: countriesDb,
                themes: themesDb,
                titles: titlesDb,
                descriptions: descriptionsDb,
                tags: tagsDb,
                images: imagesDb
            })
        }

        return ingredient
    }

    async getOptions() {
        const options = {}

        options.themes = await IngredientThemeModel.find()
        options.tags = await IngredientTagModel.find()

        return options
    }

    async getIngredients() {
        return IngredientModel.find()
    }
}

module.exports = new IngredientService()