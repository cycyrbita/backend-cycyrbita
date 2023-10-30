const {Schema, model} = require('mongoose')

const IngredientLanguageSchema = new Schema({
  description: {type: String},
  language: {type: String},
  themes: {type: Array},
})

module.exports = model('IngredientLanguage', IngredientLanguageSchema.set('timestamps', true))