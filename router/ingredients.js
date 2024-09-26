const ingredients = require('express').Router()
const ingredientController = require('../controllers/ingredient-controller')
const authMiddleware = require("../middleware/auth-middleware")
const permissionsMiddleware = require('../middleware/permissions-middleware')

ingredients.get('/get-ingredient-themes', authMiddleware, (req, res, next) => permissionsMiddleware(req, res, next, ['ingredients']), ingredientController.getIngredientThemes)
ingredients.post('/create-ingredient-theme', authMiddleware, (req, res, next) => permissionsMiddleware(req, res, next, ['ingredients']), ingredientController.createIngredientTheme)
ingredients.post('/create-ingredient', authMiddleware, (req, res, next) => permissionsMiddleware(req, res, next, ['ingredients']), ingredientController.createIngredient)
ingredients.post('/get-ingredients', authMiddleware, (req, res, next) => permissionsMiddleware(req, res, next, ['ingredients']), ingredientController.getIngredients)
ingredients.post('/get-ingredient', authMiddleware, (req, res, next) => permissionsMiddleware(req, res, next, ['ingredients']), ingredientController.getIngredient)
ingredients.delete('/deleted-ingredient', authMiddleware, (req, res, next) => permissionsMiddleware(req, res, next, ['ingredients']), ingredientController.deletedIngredient)
ingredients.post('/edit-ingredient', authMiddleware, (req, res, next) => permissionsMiddleware(req, res, next, ['ingredients']), ingredientController.editIngredient)

module.exports = ingredients