const IngredientService = require("../service/ingredient-service")
const ApiError = require("../exceptions/api-error");

class IngredientController {
    async create(req, res, next) {
        try {
            // проверка на файлы
            if(!req.files) throw ApiError.BadRequest(`Файлов нет!`)

            let {ingredients} = req.files

            // если это не массив то делаем из него массив
            if(!Array.isArray(req.files.ingredients)) ingredients = [req.files.ingredients]

            // запускаем функцию создания ингредиента
            const ingredientData = await IngredientService.create(ingredients)

            return res.json({ingredientData})
        } catch (e) {
            next(e)
        }
    }
}

module.exports = new IngredientController()