// const ingredientService = require('../service/ingredient-service')
// const {validationResult} = require('express-validator')
// const ApiError = require('../exceptions/api-error')

class IngredientController {
    async create(req, res, next) {
        try {
            const {} = req.body
            return res.json({message: 'Ingredients'})
        } catch (e) {
            next(e)
        }
    }
}

module.exports = new IngredientController()