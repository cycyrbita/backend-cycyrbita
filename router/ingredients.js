const ingredients = require('express').Router()
const ingredientController = require('../controllers/ingredient-controller')

ingredients.post('/create', ingredientController.create)
ingredients.post('/get-ingredients', ingredientController.getIngredients)

module.exports = ingredients