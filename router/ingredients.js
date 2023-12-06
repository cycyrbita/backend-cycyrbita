const ingredients = require('express').Router()
const ingredientController = require('../controllers/ingredient-controller')

ingredients.post('/create-ingredient', ingredientController.create)
ingredients.post('/get-ingredients', ingredientController.getIngredients)
ingredients.post('/get-ingredient', ingredientController.getIngredient)
ingredients.delete('/deleted-ingredient', ingredientController.deletedIngredient)
ingredients.post('/edit-ingredient', ingredientController.editIngredient)

module.exports = ingredients