const IngredientService = require("../service/ingredient-service")

class IngredientController {
    async getIngredientThemes(req, res, next) {
        try {
            let themes = await IngredientService.getIngredientThemes()
            return res.json(themes.map(el => ({theme: el.theme})))
        } catch (e) {
            next(e)
        }
    }

    async createIngredientTheme(req, res, next) {
        try {
            const {theme} = req.body

            return res.json(await IngredientService.createIngredientTheme({theme}))
        } catch (e) {
            next(e)
        }
    }

    async createIngredient(req, res, next) {
        try {
            let ingredientsImages = null
            // данные ингредиента
            const ingredient = JSON.parse(req.body.ingredient)

            // проверка на файлы
            if(req.files) ingredientsImages = req.files.ingredientsImages

            // если это не массив то делаем из него массив
            if(ingredientsImages && !Array.isArray(req.files.ingredientsImages)) ingredientsImages = [req.files.ingredientsImages]

            // запускаем функцию создания ингредиента
            const ingredientData = await IngredientService.createIngredient(ingredientsImages, ingredient)

            return res.json({ingredientData})
        } catch (e) {
            next(e)
        }
    }

    async getIngredients(req, res, next) {
        try {
            const {paginationCount, limit, filterIngredients} = req.body

            // получаем ингредиенты
            const {ingredients, ingredientsLength} = await IngredientService.getIngredients(paginationCount, limit, filterIngredients)

            return res.json({ingredients, ingredientsLength})
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

    async editIngredient(req, res, next) {
        try {
            let ingredientsImages = null
            // данные ингредиента
            const ingredient = JSON.parse(req.body.ingredient)

            // проверка на файлы
            if(req.files) ingredientsImages = req.files.ingredientsImages

            // если это не массив то делаем из него массив
            if(ingredientsImages && !Array.isArray(req.files.ingredientsImages)) ingredientsImages = [req.files.ingredientsImages]

            // запускаем функцию редактирования ингредиента
            const ingredientData = await IngredientService.editIngredient(ingredientsImages, ingredient)

            return res.json({ingredientData})
        } catch (e) {
            next(e)
        }
    }
}

module.exports = new IngredientController()