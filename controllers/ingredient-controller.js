const IngredientService = require("../service/ingredient-service")
const ApiError = require("../exceptions/api-error")

class IngredientController {
    async create(req, res, next) {
        try {
            // проверка на файлы
            if(!req.files) throw ApiError.BadRequest(`Файлов нет!`)

            let ingredientsImages = req.files
            let ingredients = JSON.parse(req.body.ingredients)

            // если это не массив то делаем из него массив
            if(ingredientsImages && !Array.isArray(req.files.ingredientsImages)) ingredientsImages = [req.files.ingredientsImages]

            // запускаем функцию создания ингредиента
            const ingredientData = await IngredientService.create(ingredientsImages, ingredients)

            return res.json({ingredientData})
        } catch (e) {
            next(e)
        }
    }
}

module.exports = new IngredientController()