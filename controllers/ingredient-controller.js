const IngredientService = require("../service/ingredient-service")

class IngredientController {
    async create(req, res, next) {
        try {
            let ingredientsImages = null
            // данные ингредиента
            let ingredients = JSON.parse(req.body.ingredients)

            // проверка на файлы
            if(req.files) ingredientsImages = req.files.ingredientsImages

            // если это не массив то делаем из него массив
            if(ingredientsImages && !Array.isArray(req.files.ingredientsImages)) ingredientsImages = [req.files.ingredientsImages]

            // console.log(ingredients)
            // console.log(ingredientsImages)

            // запускаем функцию создания ингредиента
            const ingredientData = await IngredientService.create(ingredientsImages, ingredients)

            return res.json({ingredientData})
        } catch (e) {
            next(e)
        }
    }

    async getOptions (req, res, next) {
        try {
            const options = await IngredientService.getOptions()
            return res.json(options)
        } catch (e) {
            next(e)
        }
    }

    async getIngredients (req, res, next) {
        try {
            return res.json(await IngredientService.getIngredients())
        } catch (e) {
            next(e)
        }
    }
}

module.exports = new IngredientController()