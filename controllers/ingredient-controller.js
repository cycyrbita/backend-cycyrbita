const IngredientService = require("../service/ingredient-service")

class IngredientController {
    async create(req, res, next) {
        try {
            let ingredientsImages = null
            // данные ингредиента
            const ingredients = JSON.parse(req.body.ingredients)

            // проверка на файлы
            if(req.files) ingredientsImages = req.files.ingredientsImages

            // если это не массив то делаем из него массив
            if(ingredientsImages && !Array.isArray(req.files.ingredientsImages)) ingredientsImages = [req.files.ingredientsImages]

            // запускаем функцию создания ингредиента
            const ingredientData = await IngredientService.create(ingredientsImages, ingredients)

            return res.json({ingredientData})
        } catch (e) {
            next(e)
        }
    }

    async getIngredients(req, res, next) {
        try {
            // получаем ингредиенты
            const ingredients = await IngredientService.getIngredients()

            return res.json(ingredients)
        } catch (e) {
            next(e)
        }
    }

    async getIngredient(req, res, next) {
        try {
            const {id} = req.body
            // получаем ингредиенты
            const ingredient = await IngredientService.getIngredient(id)

            return res.json(ingredient)
        } catch (e) {
            next(e)
        }
    }

    async deletedIngredient(req, res, next) {
        try {
            const {id, images} = req.body

            // получаем ингредиенты
            const ingredient = await IngredientService.deletedIngredient(id, images)

            return res.json(ingredient)
        } catch (e) {
            next(e)
        }
    }
}

module.exports = new IngredientController()