const ingredients = require('express').Router()
const ingredientController = require('../controllers/ingredient-controller')

const ingredientsMiddleware = require('../middleware/ingredients-middleware')

ingredients.post('/create', ingredientController.create)

module.exports = ingredients