const {Schema, model} = require('mongoose')

const IngredientDescriptionSchema = new Schema({
  description: {type: String},
  country: {type: String},
  themes: {type: Array},
})

module.exports = model('IngredientDescription', IngredientDescriptionSchema.set('timestamps', true))