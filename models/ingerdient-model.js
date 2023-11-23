const {Schema, model} = require('mongoose')

const IngredientSchema = new Schema({
  names: {type: Array, default: []},
  themes: {type: Array, default: []},
  images: {type: Array, default: []},
})

module.exports = model('Ingredient', IngredientSchema.set('timestamps', true))