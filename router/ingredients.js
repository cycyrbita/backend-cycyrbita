const ingredients = require('express').Router()
const ingredientController = require('../controllers/ingredient-controller')

ingredients.post('/create', ingredientController.create)
ingredients.get('/options', ingredientController.getOptions)

module.exports = ingredients