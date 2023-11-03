const sharp = require('sharp')
const ApiError = require("../exceptions/api-error");

class IngredientService {
    async create(ingredients) {
        // указываем типы которые хотим принимать
        const MIMETYPE = ['image/jpeg', 'image/jpg', 'image/svg+xml', 'image/png', 'image/webp']

        // список файлов которые не прошли проверку
        let errorMimetype = []

        // перебираем все файлы и запускаем sharp
        await ingredients.forEach(el => {
            // пушим файл который не прошел проверку
            if(!MIMETYPE.includes(el.mimetype)) return errorMimetype.push(el.name)

            // забираем формат
            let format = el.mimetype.split('/')
            if(format[1] === 'svg+xml') format[1] = 'svg'

            // рандомное имя
            let fileName = `ingredients-${Date.now()}.${format[1]}`

            // загружаем файл
            sharp(el.data)
                .toBuffer((err) => {if(err) console.log(err)})
                .toFile(`${process.env.IMG_PATH}/ingredients/${fileName}`, (err) => {if(err) console.log(err)})
        })

        // возвращаем список незагруженных файлов
        if(errorMimetype.length) return errorMimetype

        return 'Ингредиент создан!'
    }
}

module.exports = new IngredientService()