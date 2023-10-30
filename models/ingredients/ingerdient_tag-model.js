const {Schema, model} = require('mongoose')

const IngredientTagSchema = new Schema({
  tag: {type: String},
  themes: {type: Array},
})

module.exports = model('IngredientTag', IngredientTagSchema.set('timestamps', true))