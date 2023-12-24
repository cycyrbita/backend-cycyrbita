const ingredients = require('express').Router()
const ingredientController = require('../controllers/ingredient-controller')
const authMiddleware = require("../middleware/auth-middleware");

ingredients.get('/get-ingredient-themes', authMiddleware, ingredientController.getIngredientThemes)
ingredients.post('/create-ingredient-theme', authMiddleware, ingredientController.createIngredientTheme)
ingredients.post('/create-ingredient', authMiddleware, ingredientController.createIngredient)
ingredients.post('/get-ingredients', authMiddleware, ingredientController.getIngredients)
ingredients.post('/get-ingredient', authMiddleware, ingredientController.getIngredient)
ingredients.delete('/deleted-ingredient', authMiddleware, ingredientController.deletedIngredient)
ingredients.post('/edit-ingredient', authMiddleware, ingredientController.editIngredient)

module.exports = ingredients