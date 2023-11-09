const {Schema, model} = require('mongoose')

const IngredientSchema = new Schema({
  countrys: {type: Array},
  themes: {type: Array},
  titles: {type: Array},
  descriptions: {type: Array},
  tags: {type: Array},
  images: {type: Array}
})

module.exports = model('Ingredient', IngredientSchema.set('timestamps', true))