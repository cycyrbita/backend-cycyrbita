const ingredients = require('express').Router()
const ingredientController = require('../controllers/ingredient-controller')

ingredients.post('/create', ingredientController.create)

module.exports = ingredients